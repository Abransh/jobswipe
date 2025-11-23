# 🚀 JobSwipe Deployment Quick Reference

Complete deployment guide for your full-stack monorepo application.

---

## 📊 Your Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USERS / CLIENTS                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  🌐 FRONTEND - Vercel (Global CDN)                          │
│  • Next.js 15 App Router                                    │
│  • Auto HTTPS/SSL                                           │
│  • URL: https://your-app.vercel.app                        │
│  • Build: Monorepo workspace packages                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ API Calls
┌─────────────────────────────────────────────────────────────┐
│  🔧 BACKEND - DigitalOcean App Platform                     │
│  • Fastify API Server                                       │
│  • Auto Deploy from Git                                     │
│  • URL: https://your-api.ondigitalocean.app               │
│  • Build: Monorepo workspace packages                       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌─────────────────┐
│ 🗄️ PostgreSQL   │ │ 💾 Redis     │ │ 📦 S3 Storage  │
│ Neon Serverless  │ │ Upstash      │ │ DO Spaces      │
│ (EU Central)     │ │ (Serverless) │ │ (NYC)          │
└──────────────────┘ └──────────────┘ └─────────────────┘
```

---

## ⚡ Quick Deploy Commands

### **Frontend (Vercel)**
```bash
# From repository root
cd jobswipe

# Deploy to preview
vercel --cwd apps/web

# Deploy to production
vercel --prod --cwd apps/web
```

### **Backend (DigitalOcean)**
```bash
# From repository root
cd jobswipe

# Push to deploy
git push origin main

# DigitalOcean auto-deploys from main branch
```

---

## 🔐 Critical Environment Variables

### **Frontend (Vercel)**
```bash
NEXT_PUBLIC_API_URL=https://your-api-url.ondigitalocean.app
JWT_SECRET=<MUST_MATCH_API_SERVER>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Set in**: Vercel Dashboard → Project → Settings → Environment Variables

### **Backend (DigitalOcean)**
```bash
DATABASE_URL=<YOUR_NEON_DATABASE_URL>
REDIS_URL=<YOUR_UPSTASH_REDIS_URL>
JWT_SECRET=<GENERATE_SECURE_SECRET>
JWT_REFRESH_SECRET=<GENERATE_SECURE_SECRET>
ENCRYPTION_KEY=<GENERATE_SECURE_KEY>
AWS_ACCESS_KEY_ID=<DO_SPACES_KEY>
AWS_SECRET_ACCESS_KEY=<DO_SPACES_SECRET>
API_CORS_ORIGIN=https://your-app.vercel.app
NODE_ENV=production
```

**Set in**: DigitalOcean Dashboard → App → Settings → Environment Variables

---

## 🔧 Build Process (Monorepo)

Both platforms build workspace packages in the same order:

```bash
1. Install pnpm globally
2. Install all dependencies (frozen lockfile)
3. Generate Prisma Client
4. Build @jobswipe/shared
5. Build @jobswipe/database
6. Build @jobswipe/web OR @jobswipe/api
```

**Why this works:**
- ✅ All workspace packages available
- ✅ TypeScript finds all dependencies
- ✅ No "module not found" errors
- ✅ Reproducible builds

---

## 📋 Deployment Checklist

### **Before First Deploy**

**Backend (DigitalOcean):**
- [ ] Neon PostgreSQL database created
- [ ] Upstash Redis created
- [ ] DO Spaces bucket created
- [ ] All secrets generated (JWT, encryption key)
- [ ] Environment variables added to DO
- [ ] Repository pushed to GitHub
- [ ] pnpm-lock.yaml committed

**Frontend (Vercel):**
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] JWT_SECRET copied from backend
- [ ] API_URL from DigitalOcean deployment
- [ ] Environment variables added to Vercel

### **After Deployment**

- [ ] Frontend deployed successfully
- [ ] Backend deployed successfully
- [ ] Update CORS on backend with frontend URL
- [ ] Update NEXT_PUBLIC_APP_URL with Vercel URL
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test API connectivity
- [ ] Configure custom domains (optional)

---

## 🌐 Your URLs

**Fill these in after deployment:**

```bash
# Frontend
Production:  https://_____________________.vercel.app
Custom:      https://_____________________.com

# Backend
Production:  https://_____________________.ondigitalocean.app
API Health:  https://_____________________.ondigitalocean.app/health

# Database
Neon:        postgresql://_______________@ep-___________.neon.tech/neondb

# Redis
Upstash:     redis://_____________________.upstash.io:_____

# Storage
DO Spaces:   https://_____________________.nyc3.digitaloceanspaces.com
```

---

## 💰 Cost Breakdown

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **Vercel** | Free | $0/mo | 100GB bandwidth/mo |
| **DigitalOcean** | Basic XS | $12/mo | First 2 months FREE with credits |
| **DO Spaces** | Standard | $5/mo | Covered by credits |
| **Neon PostgreSQL** | Free | $0/mo | 0.5GB storage |
| **Upstash Redis** | Free | $0/mo | 10K commands/day |
| **TOTAL** | | **$17/mo** | **First 2 months: $0** |

---

## 🔍 Troubleshooting

### **Frontend Build Fails**

**Check:**
1. Workspace packages built in correct order?
2. Prisma Client generated?
3. Environment variables set?
4. pnpm-lock.yaml committed?

**Solution:**
```bash
# View build logs in Vercel Dashboard
# Or via CLI:
vercel logs <deployment-url>
```

### **Backend Build Fails**

**Check:**
1. Workspace packages built in correct order?
2. Prisma Client generated?
3. pnpm-lock.yaml committed?
4. Build command in .do/app.yaml correct?

**Solution:**
```bash
# View build logs in DO Dashboard
# Settings → Runtime Logs → Build Logs
```

### **API Connection Failed**

**Check:**
1. NEXT_PUBLIC_API_URL set correctly?
2. CORS includes frontend URL?
3. API actually deployed and running?
4. JWT_SECRET matches between frontend/backend?

**Test:**
```bash
# Test API health
curl https://your-api.ondigitalocean.app/health

# Should return:
# {"status":"ok","timestamp":"2025-11-17...","environment":"production"}
```

### **Database Connection Failed**

**Check:**
1. DATABASE_URL format correct?
2. Database actually created in Neon?
3. Connection pooling enabled?
4. SSL mode required?

**Test:**
```bash
# Test connection (requires psql)
psql "$DATABASE_URL" -c "SELECT 1"
```

---

## 📚 Documentation Links

- **Frontend Deploy**: `VERCEL_FRONTEND_DEPLOYMENT.md`
- **Backend Deploy**: `DIGITALOCEAN_DEPLOYMENT_GUIDE.md`
- **Hybrid Setup**: `HYBRID_DEPLOYMENT_GUIDE.md`
- **Production Setup**: `PRODUCTION_SETUP_GUIDE.md`
- **Deployment Script**: `DEPLOY_SCRIPT_README.md`
- **CTO Guide**: `CTO_DEPLOYMENT_GUIDE.md`

---

## 🎯 Common Tasks

### **Update Frontend**
```bash
git add -A
git commit -m "feat: update frontend"
git push origin main
# Vercel auto-deploys
```

### **Update Backend**
```bash
git add -A
git commit -m "feat: update backend"
git push origin main
# DigitalOcean auto-deploys
```

### **Run Database Migrations**
```bash
# From repository root
cd packages/database
pnpm run db:migrate:deploy

# Or via DO dashboard:
# Console → Run Command → pnpm run db:migrate:deploy
```

### **View Logs**
```bash
# Frontend (Vercel)
vercel logs --follow

# Backend (DigitalOcean)
# Dashboard → Runtime Logs
```

### **Rollback Deployment**
```bash
# Frontend (Vercel)
vercel rollback <deployment-url>

# Backend (DigitalOcean)
# Dashboard → Deployments → Click previous version → Redeploy
```

---

## ✅ Success Criteria

Your deployment is successful when:

- [ ] Frontend loads at Vercel URL
- [ ] Backend responds to `/health` endpoint
- [ ] User can register new account
- [ ] User can login with credentials
- [ ] API calls work from frontend
- [ ] Database queries execute successfully
- [ ] Redis caching works
- [ ] File uploads work (if applicable)
- [ ] OAuth providers work (if configured)
- [ ] No console errors in browser
- [ ] No 500 errors in API logs

---

## 🆘 Getting Help

**Build Issues:**
- Check build logs first
- Verify environment variables
- Test locally: `pnpm --filter @jobswipe/web build`

**Runtime Issues:**
- Check runtime logs
- Test API endpoints manually
- Verify database connectivity

**Deployment Issues:**
- Review deployment docs
- Check service status pages
- Verify Git repository is up to date

---

**🎉 You're all set!**

Your JobSwipe platform is now fully deployed with:
- Global CDN frontend (Vercel)
- Scalable API backend (DigitalOcean)
- Serverless database (Neon)
- Serverless cache (Upstash)
- Cloud storage (DO Spaces)

**Total setup time:** ~30-45 minutes
**Monthly cost:** $17 (first 2 months FREE)
