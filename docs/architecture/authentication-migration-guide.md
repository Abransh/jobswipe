# Authentication System Migration Guide

## Overview

This guide covers the migration from the legacy authentication system to the unified authentication system with enhanced security features.

## Executive Summary

**Current State:** Two authentication implementations exist
- `auth.routes.ts` (LEGACY - currently active)
- `auth.unified.routes.ts` (NEW - ready for rollout)

**Migration Goal:** Zero-downtime transition to unified authentication with enhanced security

**Timeline:** 2-4 weeks (comprehensive testing + gradual rollout)

---

## What's Changing

### Security Enhancements

| Feature | Legacy System | Unified System |
|---------|--------------|----------------|
| **Account Lockout** | ❌ None | ✅ 5 failed attempts → 30-min lockout |
| **Email Verification** | ❌ Not implemented | ✅ Required for new users |
| **Login Tracking** | ❌ Basic | ✅ Attempts tracked, lockout enforced |
| **Password Reset** | ⚠️ Partial | ✅ Complete with token expiry |
| **Session Management** | ✅ Redis sessions | ✅ Enhanced with audit logging |
| **CSRF Protection** | ⚠️ Partial | ✅ Integrated with advanced-security plugin |

### New Features

1. **Email Verification Flow**
   - New users must verify email before full access
   - Verification tokens expire in 24 hours
   - Resend verification endpoint available

2. **Account Lockout Protection**
   - Automatic lockout after 5 failed login attempts
   - 30-minute lockout duration
   - Automatic unlock after timeout
   - Audit logging for security events

3. **Enhanced Password Reset**
   - Tokens expire in 15 minutes
   - One-time use tokens
   - All sessions revoked on password reset
   - Secure token hashing (SHA-256)

4. **Desktop Token Exchange**
   - QR code generation for desktop app
   - Secure token exchange flow
   - Device tracking and audit

---

## Migration Strategy

### Phase 1: Preparation (Week 1, Days 1-3)

#### 1.1 Environment Setup

```bash
# Add feature flag to .env.local
USE_UNIFIED_AUTH="false"  # Start with legacy system
```

#### 1.2 Database Verification

Verify Prisma schema includes all required fields:

```sql
-- Required fields for unified auth
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN (
  'loginAttempts',
  'lockedUntil',
  'emailVerified',
  'dataConsent',
  'consentDate',
  'ipAddress',
  'userAgent',
  'locale'
);
```

All fields should exist. If not, run:

```bash
npx prisma migrate dev --name add_unified_auth_fields
```

#### 1.3 Dependency Check

Ensure all services are running:

```bash
# Check PostgreSQL
psql $DATABASE_URL -c "SELECT 1"

# Check Redis
redis-cli ping

# Check environment variables
node -e "console.log(process.env.JWT_SECRET ? '✅ JWT_SECRET set' : '❌ JWT_SECRET missing')"
```

### Phase 2: Local Testing (Week 1, Days 4-7)

#### 2.1 Enable Unified Auth Locally

```bash
# Update .env.local
USE_UNIFIED_AUTH="true"

# Restart API server
npm run dev:api
```

#### 2.2 Test All Endpoints

**Registration Flow:**
```bash
# 1. Register new user
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User",
    "source": "web",
    "termsAccepted": true,
    "privacyAccepted": true
  }'

# Expected: 201 Created with verification message

# 2. Verify email (check server logs for token in dev)
curl -X POST http://localhost:4000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_FROM_LOGS"}'

# Expected: 200 OK with success message
```

**Login Flow:**
```bash
# 1. Login with verified account
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "source": "web"
  }'

# Expected: 200 OK with access/refresh tokens
```

**Account Lockout Test:**
```bash
# Attempt login with wrong password 5 times
for i in {1..5}; do
  curl -X POST http://localhost:4000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "WrongPassword",
      "source": "web"
    }'
  echo "\nAttempt $i"
done

# 6th attempt should return ACCOUNT_LOCKED error
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "source": "web"
  }'

# Expected: 401 with "Account is temporarily locked"
```

**Password Reset Flow:**
```bash
# 1. Request password reset
curl -X POST http://localhost:4000/api/v1/auth/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "source": "web"
  }'

# Expected: 200 OK (check logs for reset token)

# 2. Complete password reset
curl -X POST http://localhost:4000/api/v1/auth/password/reset-complete \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_LOGS",
    "newPassword": "NewSecurePass123",
    "source": "web"
  }'

# Expected: 200 OK with success message
```

#### 2.3 Test Web/Desktop Clients

```bash
# Start web app
cd apps/web
npm run dev

# Start desktop app
cd apps/desktop
npm run dev

# Test flows:
# ✅ Web registration
# ✅ Web login
# ✅ Desktop token exchange
# ✅ Password reset from web
# ✅ Email verification
```

### Phase 3: Staging Deployment (Week 2, Days 8-14)

#### 3.1 Deploy to Staging

```bash
# Deploy with feature flag OFF
USE_UNIFIED_AUTH="false"

# Verify deployment
curl https://staging-api.jobswipe.com/health

# Switch to unified auth
USE_UNIFIED_AUTH="true"

# Restart API server
# Monitor logs for errors
```

#### 3.2 Staging Validation (48 hours)

**Monitoring Checklist:**

```bash
# Error rate
grep "ERROR" /var/log/jobswipe/api.log | wc -l
# Target: < 10 errors per hour

# Response time (p95)
# Target: < 200ms

# Login success rate
# Target: > 95%

# Account lockout events
grep "Account is temporarily locked" /var/log/jobswipe/api.log
# Verify legitimate lockouts only
```

**Load Testing:**

```bash
# Install k6 for load testing
npm install -g k6

# Run load test (100 concurrent users)
k6 run --vus 100 --duration 5m tests/load/auth-endpoints.js

# Verify:
# ✅ No errors under load
# ✅ Response time < 200ms (p95)
# ✅ All endpoints functional
```

#### 3.3 Rollback Test

```bash
# Test rollback capability
USE_UNIFIED_AUTH="false"

# Verify:
# ✅ Switches back to legacy system
# ✅ No data loss
# ✅ Existing sessions still valid
# ✅ No errors
```

### Phase 4: Production Rollout (Week 3-4, Days 15-28)

#### 4.1 Pre-Deployment Checklist

- [ ] All staging tests passed
- [ ] 48-hour staging validation complete
- [ ] Load testing successful
- [ ] Rollback procedure tested
- [ ] Team trained on new features
- [ ] Monitoring dashboards configured
- [ ] Alert thresholds set
- [ ] Incident response plan ready

#### 4.2 Gradual Rollout Schedule

**Day 15 (Friday):** Deploy with flag OFF
```bash
# Deploy new code but keep legacy system active
USE_UNIFIED_AUTH="false"

# Verify deployment successful
# Monitor for 24 hours
```

**Day 17 (Sunday, 3 AM low traffic):** Enable unified auth
```bash
# Switch to unified authentication
USE_UNIFIED_AUTH="true"

# Restart API servers with rolling restart
# Monitor closely for 6 hours
```

**Day 18-20:** Monitor and validate
- Track error rates
- Monitor login success rates
- Verify account lockouts are legitimate
- Check email verification flow
- Monitor desktop token exchange

**Day 21:** Full validation
- Run comprehensive test suite
- Verify all features working
- Check analytics for anomalies

**Day 22-28:** Continued monitoring
- Daily error rate checks
- Weekly metrics review
- User feedback monitoring

#### 4.3 Production Monitoring

**Key Metrics:**

```javascript
// Metrics to track
const metrics = {
  authentication: {
    loginSuccessRate: "> 95%",
    loginResponseTime: "< 200ms (p95)",
    registrationSuccessRate: "> 98%",
    emailVerificationRate: "> 80% (within 24h)",
  },
  security: {
    accountLockoutRate: "< 1% of users",
    failedLoginAttempts: "< 5 per user per day",
    passwordResetCompletionRate: "> 90%",
  },
  errors: {
    errorRate: "< 0.1%",
    tokenExpirationErrors: "< 0.5%",
    databaseErrors: "0",
  },
};
```

**Alert Configuration:**

```yaml
alerts:
  - name: High Error Rate
    condition: error_rate > 1%
    severity: critical
    action: Page on-call engineer

  - name: Login Failure Spike
    condition: failed_logins > 100/minute
    severity: high
    action: Notify security team

  - name: Account Lockout Spike
    condition: account_lockouts > 50/hour
    severity: medium
    action: Investigate logs

  - name: Slow Response Time
    condition: p95_response_time > 500ms
    severity: medium
    action: Check server resources
```

### Phase 5: Cleanup (Week 4+)

#### 5.1 Deprecation Timeline

**After 2 weeks of successful production:**

```bash
# Remove feature flag (unified auth becomes default)
# Delete legacy auth.routes.ts
git rm apps/api/src/routes/auth.routes.ts

# Update imports in index.ts
# Remove feature flag logic
```

#### 5.2 Documentation Updates

- [ ] Update API documentation
- [ ] Update client integration guides
- [ ] Document new security features
- [ ] Create troubleshooting guide
- [ ] Update runbooks

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

If critical issues detected:

```bash
# 1. Set feature flag to false
export USE_UNIFIED_AUTH="false"

# 2. Restart API servers
pm2 restart jobswipe-api

# 3. Verify rollback successful
curl https://api.jobswipe.com/health
```

### Database Rollback

No database changes required - both systems use same schema.

### Session Handling

Sessions created in unified system remain valid in legacy system.

---

## Troubleshooting

### Common Issues

**Issue: Email verification not working**
```bash
# Check verification token generation
grep "Email verification token generated" /var/log/jobswipe/api.log

# Verify VerificationToken table
psql $DATABASE_URL -c "SELECT * FROM verification_tokens WHERE identifier LIKE 'email-verify:%' LIMIT 5;"
```

**Issue: Account lockout too aggressive**
```bash
# Check lockout thresholds
# Current: 5 attempts, 30 minutes

# Adjust in auth.unified.routes.ts:
const ACCOUNT_LOCKOUT_THRESHOLD = 5;
const ACCOUNT_LOCKOUT_DURATION_MS = 30 * 60 * 1000;
```

**Issue: Desktop token exchange failing**
```bash
# Verify token exchange tokens
psql $DATABASE_URL -c "SELECT * FROM verification_tokens WHERE identifier LIKE 'token-exchange:%' LIMIT 5;"

# Check expiration (5 minutes)
# Verify desktop app using correct API endpoint
```

---

## FAQ

**Q: Will existing users need to re-login?**
A: No, existing sessions remain valid.

**Q: Do existing users need to verify their email?**
A: No, only new registrations require verification. Existing users have `emailVerified = null` which is treated as verified.

**Q: Can we adjust the account lockout threshold?**
A: Yes, modify constants in `auth.unified.routes.ts`:
```typescript
const ACCOUNT_LOCKOUT_THRESHOLD = 5;  // Change this
const ACCOUNT_LOCKOUT_DURATION_MS = 30 * 60 * 1000;  // Or this
```

**Q: How do we test in production without affecting users?**
A: Use the feature flag with gradual rollout at low-traffic times (3 AM Sunday).

**Q: What if we need to rollback after 1 week?**
A: Rollback is safe at any time - just set `USE_UNIFIED_AUTH="false"`.

---

## Success Criteria

Migration is considered successful when:

✅ **Performance:**
- Error rate < 0.1%
- Login response time < 200ms (p95)
- Login success rate > 95%

✅ **Security:**
- Account lockout functioning correctly
- Email verification working for new users
- Password reset flow complete
- No security incidents

✅ **Stability:**
- 2 weeks in production without issues
- No critical bugs reported
- Rollback not needed

✅ **User Experience:**
- No increase in support tickets
- Email verification rate > 80%
- Desktop token exchange functioning

---

## Contact

**Questions or Issues:**
- Engineering Team: engineering@jobswipe.com
- DevOps Team: devops@jobswipe.com
- Security Team: security@jobswipe.com

**Emergency Rollback:**
- On-call Engineer: [PagerDuty]
- Emergency Hotline: [Phone Number]

---

**Last Updated:** 2025-11-14
**Version:** 1.0
**Status:** Ready for Implementation
