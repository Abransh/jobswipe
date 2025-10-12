# Migration Guide: JobSwipe v1.x → v2.0

## 🎯 Quick Summary

**What Changed**: Free tier limit, proxy enforcement, API consolidation
**Breaking Changes**: None (graceful deprecation)
**Action Required**: Update frontend to use new endpoint (optional for now)
**Timeline**: Old endpoints work until v3.0 (6 months grace period)

---

## 📋 For Frontend Developers

### Update API Calls

**Replace** old swipe endpoints with the unified endpoint:

```typescript
// ❌ OLD (Deprecated but still works)
const response = await fetch('/api/queue/swipe-right', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    jobId: '123',
    resumeId: 'resume-456'
  })
});

// ✅ NEW (Recommended)
const response = await fetch(`/api/v1/jobs/${jobId}/swipe`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    direction: 'RIGHT',      // or 'LEFT'
    resumeId: 'resume-456',
    coverLetter: 'Optional cover letter',
    priority: 5,            // 1-10, optional
    metadata: {
      source: 'web',
      deviceId: deviceId
    }
  })
});
```

### Response Format Changes

**Old Response**:
```json
{
  "success": true,
  "data": {
    "applicationId": "app-123",
    "status": "QUEUED"
  }
}
```

**New Response** (Server Automation):
```json
{
  "success": true,
  "message": "Right swipe processed - server automation completed",
  "data": {
    "jobId": "job-123",
    "direction": "RIGHT",
    "action": "automated_immediately",
    "executionMode": "server",
    "automation": {
      "success": true,
      "applicationId": "app-123",
      "confirmationNumber": "CONF-456",
      "status": "success",
      "executionTime": 45000
    },
    "serverAutomation": {
      "eligible": true,
      "remainingServerApplications": 12
    }
  },
  "correlationId": "corr-789"
}
```

**New Response** (Desktop Queue):
```json
{
  "success": true,
  "message": "Right swipe queued for desktop processing",
  "data": {
    "jobId": "job-123",
    "direction": "RIGHT",
    "action": "queued_for_desktop",
    "executionMode": "desktop",
    "applicationId": "app-123",
    "serverAutomation": {
      "eligible": false,
      "reason": "Server automation limit reached. Download desktop app.",
      "remainingServerApplications": 0,
      "upgradeRequired": false,
      "suggestedAction": "download_desktop_app"
    }
  },
  "correlationId": "corr-789"
}
```

---

## 🔧 For Backend Developers

### No Changes Required

The backend changes are **fully backwards compatible**. However, you should:

1. **Monitor deprecation warnings** in logs
2. **Update internal services** to use new endpoint
3. **Test proxy integration** in development

### Environment Variables (New)

Add proxy configuration (optional but recommended):

```bash
# BrightData (recommended for production)
BRIGHTDATA_ENDPOINT=proxy.brightdata.com:22225
BRIGHTDATA_USERNAME=your-username
BRIGHTDATA_PASSWORD=your-password
BRIGHTDATA_COUNTRY=US

# SmartProxy (alternative)
SMARTPROXY_ENDPOINT=gate.smartproxy.com:7000
SMARTPROXY_USERNAME=your-username
SMARTPROXY_PASSWORD=your-password

# ProxyMesh (budget option)
PROXYMESH_US_ENDPOINT=us-wa.proxymesh.com:31280
PROXYMESH_USERNAME=your-username
PROXYMESH_PASSWORD=your-password

# Custom proxies (JSON array)
CUSTOM_PROXY_LIST='[{"host":"proxy1.example.com","port":8080,"proxyType":"residential"}]'
```

---

## 🧪 Testing Your Migration

### 1. Test Old Endpoint (Should still work)
```bash
curl -X POST http://localhost:3001/api/queue/swipe-right \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobId": "test-job-123",
    "metadata": {"source": "web"}
  }'
```

**Expected**: Works with deprecation warning in logs

### 2. Test New Endpoint
```bash
curl -X POST http://localhost:3001/api/v1/jobs/test-job-123/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "direction": "RIGHT",
    "metadata": {"source": "web"}
  }'
```

**Expected**: Success with detailed automation status

### 3. Test Free Tier Limit
```bash
# Make 15 applications to hit free tier limit
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/v1/jobs/job-$i/swipe \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer FREE_TIER_TOKEN" \
    -d '{"direction":"RIGHT","metadata":{"source":"web"}}'
done

# 16th application should queue for desktop
curl -X POST http://localhost:3001/api/v1/jobs/job-16/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FREE_TIER_TOKEN" \
  -d '{"direction":"RIGHT","metadata":{"source":"web"}}'
```

**Expected**: First 15 execute on server, 16th queues for desktop

---

## 📊 Monitoring During Migration

### Logs to Watch

```bash
# Deprecated endpoint usage
grep "DEPRECATION WARNING" logs/*.log

# Proxy health
grep "proxy_selected\|proxy_unavailable" logs/*.log

# Limit enforcement
grep "limit_approaching\|Server automation limit reached" logs/*.log

# New endpoint usage
grep "POST /api/v1/jobs/.*/swipe" logs/access.log
```

### Metrics to Track

1. **Endpoint Migration Progress**:
   - % of requests using old endpoints (should decrease)
   - % of requests using new endpoint (should increase)

2. **Free Tier Behavior**:
   - Average applications before hitting limit
   - Desktop app download rate after hitting limit
   - Conversion to paid plans

3. **Proxy Performance**:
   - Proxy pool availability
   - Average success rate
   - Cost per application

---

## 🚨 Troubleshooting

### Issue: "Proxy service unavailable" Error

**Cause**: No proxies configured or all proxies exhausted

**Solution**:
1. Check environment variables are set
2. Verify proxy credentials are valid
3. Check proxy pool health: `GET /api/v1/automation/proxy-stats`
4. Add more proxy providers if needed

### Issue: User Stuck at Server Limit

**Cause**: User hit 15 application limit but not seeing desktop download prompt

**Solution**:
1. Check `serverAutomation.suggestedAction` in response
2. Frontend should show desktop app download modal
3. Verify WebSocket events are being received

### Issue: Deprecated Endpoint Still Being Used

**Cause**: Frontend not updated

**Solution**:
1. Search codebase for `/api/queue/swipe-right` and `/api/queue/apply`
2. Replace with `/api/v1/jobs/:id/swipe`
3. Update API client libraries

---

## 📅 Deprecation Timeline

### Phase 1: Now - Month 3
- ✅ Deprecation warnings logged
- ✅ Old endpoints fully functional
- ✅ New endpoint available
- **Action**: Migrate frontend at your convenience

### Phase 2: Month 3 - Month 6
- ⚠️ Deprecation warnings shown in UI
- ✅ Old endpoints still functional
- **Action**: Complete migration before Month 6

### Phase 3: Month 6+ (v3.0)
- ❌ Old endpoints removed
- ✅ Only new endpoint available
- **Action**: Ensure all clients updated

---

## ✅ Migration Checklist

### For Each Frontend Application

- [ ] Replace `/api/queue/swipe-right` with `/api/v1/jobs/:id/swipe`
- [ ] Replace `/api/queue/apply` with `/api/v1/jobs/:id/swipe`
- [ ] Update request payload to include `direction` field
- [ ] Handle new response format
- [ ] Test with free tier user (0-15 apps)
- [ ] Test with free tier user at limit (15+ apps)
- [ ] Test with paid tier user
- [ ] Update error handling for new error codes
- [ ] Test WebSocket integration still works

### For Backend Services

- [ ] Add proxy environment variables (if using server automation)
- [ ] Update internal service calls to use new endpoint
- [ ] Set up monitoring for proxy health
- [ ] Configure alerting for proxy exhaustion
- [ ] Test proxy failover scenarios
- [ ] Update API documentation
- [ ] Update Postman/API collections

---

## 🆘 Need Help?

1. **Check ARCHITECTURE_UPDATE.md** for technical details
2. **Review test files** for usage examples
3. **Check logs** for specific error messages
4. **Contact**: engineering@jobswipe.com

---

**Version**: 2.0.0
**Last Updated**: 2025-01-14
**Grace Period Ends**: 2025-07-14
