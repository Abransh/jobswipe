# 🚀 Hybrid Deployment Guide - Best of All Platforms
## Vercel (Frontend) + DigitalOcean (API) + Upstash (Redis)

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Prepared By:** DevOps CTO
**Strategy:** Hybrid Multi-Platform (Optimal Setup)
**Docker Required:** ❌ NO - Not needed!

---

## 📋 Executive Summary

This is the **OPTIMAL deployment strategy** for JobSwipe, combining the best features of each platform:

- ✅ **Vercel** - Frontend (Next.js) - Best Next.js hosting in the world
- ✅ **DigitalOcean** - API (Fastify) - Use your credits, excellent managed database
- ✅ **Upstash** - Redis - Serverless, better than DO's discontinued service
- ✅ **DigitalOcean Spaces** - File Storage - S3-compatible, included with credits
- ❌ **No Docker** - Both platforms auto-detect Node.js and build automatically

### Why This is Better Than Single Platform

| Feature | Hybrid Setup | Single Platform |
|---------|-------------|-----------------|
| **Next.js Performance** | ⭐⭐⭐⭐⭐ Vercel (creators of Next.js) | ⭐⭐⭐ Good |
| **Cost** | ~$130/month (with DO credits: FREE for 2 months) | ~$150-200/month |
| **Edge Network** | ✅ Vercel's global CDN | ⚠️ Limited |
| **Image Optimization** | ✅ Automatic | ⚠️ Manual setup |
| **Serverless Functions** | ✅ Built-in | ⚠️ Limited |
| **Redis** | ✅ Upstash (serverless) | ❌ DO discontinued it |
| **API Scaling** | ✅ Easy vertical/horizontal | ✅ Good |
| **Developer Experience** | ⭐⭐⭐⭐⭐ Best | ⭐⭐⭐⭐ Great |

---

## 💰 Cost Breakdown

### Monthly Infrastructure Costs

```
FRONTEND (Vercel):
- Vercel Pro:                     $20/month
- Bandwidth:                      Included (100GB)
- Serverless functions:           Included
- Image optimization:             Included
- Edge network:                   Included

BACKEND (DigitalOcean):
- App Platform (API):             $12/month
- Managed PostgreSQL:             $55/month
- Spaces (Storage):               $5/month
- Database backups:               $13/month

CACHING (Upstash):
- Redis (Serverless):             ~$10/month
- First 10K commands/day:         FREE

EXTERNAL SERVICES:
- Anthropic API:                  ~$50/month (usage-based)
- OpenAI API (optional):          ~$20/month (usage-based)

───────────────────────────────────────────────────
TOTAL:                            ~$185/month

WITH YOUR DO CREDITS ($200):
Month 1:                          $105 (Vercel + Upstash + APIs)
Month 2:                          $105 (same)
Month 3+:                         $185/month

EFFECTIVE FIRST 2 MONTHS:        ~$105/month (47% savings!)
```

---

## 🏗️ Hybrid Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │            VERCEL (Frontend)             │               │
│  │  ┌────────────────────────────────┐     │               │
│  │  │    Next.js Web Application     │     │               │
│  │  │  - Global Edge Network         │     │               │
│  │  │  - Auto Image Optimization     │     │               │
│  │  │  - Serverless Functions        │     │               │
│  │  │  - Automatic HTTPS             │     │               │
│  │  └────────────────┬───────────────┘     │               │
│  └───────────────────┼─────────────────────┘               │
│                      │                                       │
│                      │ HTTPS API Calls                      │
│                      │                                       │
│                      ▼                                       │
│  ┌──────────────────────────────────────────┐               │
│  │      DIGITALOCEAN (Backend)              │               │
│  │  ┌────────────────────────────────┐     │               │
│  │  │   App Platform - Fastify API   │     │               │
│  │  │  - Auto-deploy from GitHub     │     │               │
│  │  │  - Auto-scaling                │     │               │
│  │  │  - Zero-downtime deploys       │     │               │
│  │  └────────┬───────────┬───────────┘     │               │
│  │           │           │                  │               │
│  │           ▼           ▼                  │               │
│  │  ┌────────────┐  ┌────────────┐         │               │
│  │  │ PostgreSQL │  │   Spaces   │         │               │
│  │  │ Database   │  │ (S3 Files) │         │               │
│  │  └────────────┘  └────────────┘         │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                        │
│                     │ Redis Connection                       │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────┐               │
│  │         UPSTASH (Redis Cache)            │               │
│  │  - Serverless (pay per request)          │               │
│  │  - Global replication                    │               │
│  │  - REST API support                      │               │
│  │  - Durable persistence                   │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

        Users ──► Vercel CDN ──► DO API ──► Upstash Redis
                      ▲              │
                      │              ▼
                      │         DO Database
                      │              │
                      └──────────────┘
```

---

## ❌ Docker? NOT NEEDED!

### Why You DON'T Need Docker

Both platforms **auto-detect and build** your Node.js applications:

```bash
# Vercel (Next.js):
✅ Detects: package.json with "next" dependency
✅ Runs: npm install && npm run build
✅ Deploys: Automatic

# DigitalOcean App Platform:
✅ Detects: package.json with Node.js
✅ Runs: Build command you specify
✅ Deploys: Automatic

# Docker is ONLY needed if:
❌ You have complex system dependencies (native modules)
❌ You need specific OS-level packages
❌ You want guaranteed environment consistency

# Your JobSwipe app:
✅ Pure Node.js + TypeScript
✅ No native dependencies
✅ Standard npm packages
→ NO DOCKER NEEDED! 🎉
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Prerequisites Checklist (15 min)

```bash
# Accounts needed:
- [ ] DigitalOcean account (with $200 credits) ✅
- [ ] Vercel account (free to start)
- [ ] Upstash account (free tier available)
- [ ] GitHub account
- [ ] Anthropic API key

# Prepare locally:
- [ ] Code pushed to GitHub
- [ ] All dependencies installed (npm install)
- [ ] Local build tested (npm run build)
- [ ] Environment variables documented
```

---

## Phase 1: Set Up Upstash Redis (10 min)

**Why Upstash Instead of DO Redis?**
- DO discontinued Managed Redis on June 30, 2025 (you're right!)
- Upstash is actually BETTER:
  - ✅ Serverless (pay per request)
  - ✅ Free tier: 10K commands/day
  - ✅ Global replication
  - ✅ REST API (works everywhere)
  - ✅ Redis-compatible

### Step 1.1: Create Upstash Account

```bash
1. Go to https://upstash.com
2. Sign up (GitHub login recommended)
3. Verify email
```

### Step 1.2: Create Redis Database

```bash
1. Click "Create Database"
2. Configuration:
   - Name: jobswipe-production
   - Type: Regional (for consistency) or Global (for performance)
   - Region: Choose closest to DigitalOcean region
     - If DO is NYC → Choose AWS us-east-1
     - If DO is SF → Choose AWS us-west-1
   - Eviction: No eviction (we manage cache ourselves)

3. Click "Create"

4. Copy credentials (you'll need these):
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

   OR traditional connection:
   - Host: us1-xxx.upstash.io
   - Port: 6379
   - Password: xxx
   - Connection string: redis://default:password@host:6379
```

**🎯 Action**: Save these values:
```bash
REDIS_URL="redis://default:YOUR_PASSWORD@us1-xxx.upstash.io:6379"
# OR for REST API:
UPSTASH_REDIS_REST_URL="https://us1-xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="YOUR_TOKEN"
```

### Step 1.3: Test Connection

```bash
# Install Upstash Redis client (if using REST):
npm install @upstash/redis

# Test locally:
node -e "
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: 'https://us1-xxx.upstash.io',
  token: 'YOUR_TOKEN'
});
redis.ping().then(console.log); // Should print 'PONG'
"
```

---

## Phase 2: Set Up DigitalOcean Backend (60 min)

### Step 2.1: Create Managed PostgreSQL (15 min)

```bash
1. Go to https://cloud.digitalocean.com/databases
2. Click "Create Database Cluster"
3. Configuration:
   - Engine: PostgreSQL 16
   - Plan: Basic ($55/month - 2GB RAM, 25GB storage)
   - Datacenter: NYC1 or SFO3 (choose closest to your users)
   - Database name: jobswipe-production

4. Wait for provisioning (5-10 minutes)

5. Get connection details:
   - Click "Connection Details"
   - Copy "Connection String"

6. Create app database:
   - Click "Users & Databases" tab
   - Create database: "jobswipe_prod"
   - Create user: "jobswipe_app" (optional, for security)

7. Connection string format:
   postgresql://jobswipe_app:password@host:25060/jobswipe_prod?sslmode=require
```

**🎯 Action**: Save `DATABASE_URL`

### Step 2.2: Create DigitalOcean Spaces (10 min)

```bash
1. Go to https://cloud.digitalocean.com/spaces
2. Click "Create a Space"
3. Configuration:
   - Region: Same as database (NYC3 or SFO3)
   - Enable CDN: YES
   - Space name: jobswipe-production-resumes
   - File Listing: Private

4. Generate API keys:
   - Go to API → Spaces Keys
   - Generate New Key: "jobswipe-production"
   - Copy Access Key ID and Secret Key IMMEDIATELY!

5. Configure CORS:
   - Space Settings → CORS
   - Add rule for your domains (we'll update after Vercel deployment)
```

**🎯 Action**: Save these:
```bash
SPACES_ACCESS_KEY_ID="DO00..."
SPACES_SECRET_ACCESS_KEY="..."
SPACES_ENDPOINT="https://nyc3.digitaloceanspaces.com"
SPACES_BUCKET="jobswipe-production-resumes"
```

### Step 2.3: Run Database Migrations (15 min)

```bash
# On your local machine:

# 1. Set DATABASE_URL
export DATABASE_URL="postgresql://jobswipe_app:PASSWORD@host:25060/jobswipe_prod?sslmode=require"

# 2. Install dependencies (if not done)
cd /home/user/jobswipe
npm install

# 3. Generate Prisma Client
npm run db:generate

# 4. Deploy migrations
cd packages/database
npx prisma migrate deploy

# Expected output:
# ✅ 5 migrations applied successfully
# ✅ Database schema is up to date

# 5. Verify
npx prisma studio
# Check tables exist: users, companies, job_postings, etc.
```

### Step 2.4: Deploy API to DigitalOcean App Platform (20 min)

```bash
# NO DOCKER NEEDED! App Platform auto-detects Node.js

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"

3. Connect GitHub:
   - Select repository: jobswipe
   - Select branch: main
   - Enable Autodeploy: ✅ (deploys on git push)

4. Configure Resources:
   - App Platform detects your code
   - Click "Edit" on detected service

   Configuration:
   - Name: api
   - Source Directory: /apps/api
   - Build Command:
     cd /workspace/jobswipe && npm install -g pnpm && pnpm install && cd apps/api && pnpm run build:production

   - Run Command:
     node dist/index.js

   - HTTP Port: 8080
   - HTTP Route: /

   - Instance Size: Basic ($12/month)
   - Instance Count: 1

5. Add Environment Variables:
   Click "Environment Variables" → Add all variables:
```

**Environment Variables for API**:
```bash
# Application
NODE_ENV=production
API_PORT=8080
API_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://jobswipe_app:PASSWORD@host:25060/jobswipe_prod?sslmode=require

# Redis (Upstash)
REDIS_URL=redis://default:PASSWORD@us1-xxx.upstash.io:6379

# Storage (DO Spaces - S3 compatible)
AWS_ACCESS_KEY_ID=DO00...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=nyc3
AWS_S3_BUCKET=jobswipe-production-resumes
AWS_ENDPOINT=https://nyc3.digitaloceanspaces.com

# JWT Secrets (generate these!)
JWT_SECRET=<openssl rand -base64 48>
JWT_REFRESH_SECRET=<openssl rand -base64 48>
SESSION_SECRET=<openssl rand -base64 32>
CSRF_SECRET=<openssl rand -base64 32>

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Security
API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://your-vercel-domain.vercel.app
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://your-vercel-domain.vercel.app
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW=900000

# Monitoring
LOG_LEVEL=info
MONITORING_ENABLED=true
```

```bash
6. Review and Create:
   - Name: jobswipe-production
   - Region: NYC (same as database)
   - Click "Create Resources"

7. Wait for deployment (10-15 minutes)
   - Watch build logs
   - First build takes longer

8. Get API URL:
   - Example: https://api-jobswipe-abc123.ondigitalocean.app
```

### Step 2.5: Test API Deployment

```bash
# Test health endpoint:
curl https://your-api-url.ondigitalocean.app/health

# Expected:
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}

# Test detailed health:
curl https://your-api-url.ondigitalocean.app/health/detailed

# Should show:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": 123
}

# Test registration:
curl -X POST https://your-api-url.ondigitalocean.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","name":"Test User"}'

# Should return user object with JWT token
```

---

## Phase 3: Deploy Frontend to Vercel (30 min)

**Why Vercel for Frontend?**
- ✅ Created Next.js (they know it best)
- ✅ Global edge network (300+ locations)
- ✅ Automatic image optimization
- ✅ Instant cache invalidation
- ✅ Analytics built-in
- ✅ Perfect DX (developer experience)

### Step 3.1: Install Vercel CLI (5 min)

```bash
# On your local machine:
npm install -g vercel

# Login:
vercel login

# Follow browser authentication
```

### Step 3.2: Configure Web App for Vercel (10 min)

```bash
# Navigate to web app:
cd /home/user/jobswipe/apps/web

# Create vercel.json (if not exists):
cat > vercel.json <<EOF
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm install && cd apps/web && pnpm run build",
  "installCommand": "pnpm install",
  "devCommand": "pnpm run dev",
  "outputDirectory": ".next"
}
EOF

# Commit this:
git add vercel.json
git commit -m "feat: Add Vercel configuration for web app"
git push origin main
```

### Step 3.3: Deploy to Vercel (15 min)

```bash
# From apps/web directory:
cd apps/web

# Deploy (first time):
vercel

# Follow prompts:
? Set up and deploy "~/jobswipe/apps/web"? [Y/n] y
? Which scope? [Your account]
? Link to existing project? [y/N] n
? What's your project's name? jobswipe-web
? In which directory is your code located? ./
? Want to override the settings? [y/N] n

# Vercel will:
✅ Detect Next.js automatically
✅ Install dependencies
✅ Build application
✅ Deploy to preview URL

# You'll get a URL like:
# https://jobswipe-web-abc123.vercel.app

# Test this preview deployment first!
```

### Step 3.4: Add Environment Variables in Vercel

```bash
# Option 1: Via CLI
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-api-url.ondigitalocean.app

vercel env add JWT_SECRET production
# Enter: [same as API JWT_SECRET]

# Option 2: Via Vercel Dashboard (RECOMMENDED)
1. Go to https://vercel.com/dashboard
2. Select your project: jobswipe-web
3. Settings → Environment Variables
4. Add variables:
```

**Environment Variables for Frontend**:
```bash
# API Connection
NEXT_PUBLIC_API_URL=https://your-api-url.ondigitalocean.app

# App URL (will update with custom domain)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# JWT Secret (must match API)
JWT_SECRET=<same-as-api>

# Database (if web app needs direct access - optional)
DATABASE_URL=<same-as-api>

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_SENTRY=false
```

```bash
# After adding variables, redeploy:
vercel --prod

# This deploys to production
# URL: https://jobswipe-web.vercel.app
```

### Step 3.5: Test Frontend Deployment

```bash
# Open in browser:
open https://jobswipe-web.vercel.app

# Test functionality:
✅ Homepage loads
✅ Can navigate
✅ Can register
✅ Can login
✅ Can see jobs
✅ Can swipe
✅ API calls working (check Network tab)

# Check Vercel Analytics:
# Dashboard → Analytics
# Should show page views, performance metrics
```

---

## Phase 4: Custom Domains (20 min)

### Step 4.1: Add Domain to Vercel (Frontend)

```bash
1. Go to Vercel Dashboard → Your Project
2. Settings → Domains
3. Add domains:
   - yourdomain.com
   - www.yourdomain.com

4. Vercel will provide DNS instructions
```

**DNS Configuration (at your domain registrar)**:
```bash
# Option A: CNAME (Recommended)
Type    Name    Value                   TTL
──────────────────────────────────────────────
CNAME   @       cname.vercel-dns.com    3600
CNAME   www     cname.vercel-dns.com    3600

# Option B: A + CNAME
Type    Name    Value                   TTL
──────────────────────────────────────────────
A       @       76.76.21.21             3600
CNAME   www     cname.vercel-dns.com    3600
```

### Step 4.2: Add Domain to DigitalOcean (API)

```bash
1. Go to DO App Platform → Your App
2. Settings → Domains
3. Add domain: api.yourdomain.com
4. DO provides CNAME value

# Add to DNS:
Type    Name    Value                               TTL
────────────────────────────────────────────────────────
CNAME   api     api-jobswipe-abc.ondigitalocean.app 3600
```

### Step 4.3: Update CORS After Domain Setup

```bash
# Update API environment variables in DO:

API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Update frontend environment in Vercel:

NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Redeploy both:
- DO: Automatic on env change
- Vercel: vercel --prod
```

### Step 4.4: Update Spaces CORS

```bash
# In DO Spaces Settings → CORS:

<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://yourdomain.com</AllowedOrigin>
    <AllowedOrigin>https://www.yourdomain.com</AllowedOrigin>
    <AllowedOrigin>https://api.yourdomain.com</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

---

## Phase 5: Desktop App Setup (20 min)

**Desktop app is NOT deployed to cloud** - users download and install it.

### Step 5.1: Update Desktop App Config

```bash
# Edit apps/desktop/src/config.ts:

export const config = {
  // Production API URL
  apiUrl: process.env.API_URL || 'https://api.yourdomain.com',

  // WebSocket URL (if using real-time features)
  wsUrl: process.env.WS_URL || 'wss://api.yourdomain.com',

  // Other config...
}
```

### Step 5.2: Build Desktop App

```bash
cd apps/desktop

# Install dependencies
npm install

# Build application
npm run build

# Package for distribution
npm run package:mac      # macOS (DMG)
npm run package:win      # Windows (NSIS installer)
npm run package:linux    # Linux (AppImage)

# Output will be in:
# apps/desktop/dist-electron/
```

### Step 5.3: Distribute Desktop App

**Option A: Direct Download from Spaces**
```bash
# 1. Upload to DigitalOcean Spaces:
# Via Dashboard: Upload DMG, EXE, AppImage to your Space

# 2. Make files public or generate signed URLs

# 3. Create download page on your website:
# https://yourdomain.com/download
```

**Option B: GitHub Releases**
```bash
# 1. Create release on GitHub
gh release create v1.0.0 \
  apps/desktop/dist-electron/*.dmg \
  apps/desktop/dist-electron/*.exe \
  apps/desktop/dist-electron/*.AppImage \
  --title "JobSwipe Desktop v1.0.0" \
  --notes "Initial release"

# 2. Users download from:
# https://github.com/YOUR_USERNAME/jobswipe/releases
```

**Option C: Auto-Updates (Recommended)**
```bash
# Already configured with electron-updater!

# 1. Upload builds to Spaces or GitHub releases
# 2. Update latest.yml, latest-mac.yml files
# 3. Desktop app checks for updates on launch
# 4. Users get notified of updates automatically
```

---

## 🔒 Security Hardening

### Step 6.1: Enable HTTPS Everywhere

```bash
# Vercel:
✅ HTTPS automatic
✅ HTTP → HTTPS redirect automatic
✅ SSL certificates auto-renewed

# DigitalOcean:
✅ HTTPS automatic
✅ Let's Encrypt certificates
✅ Auto-renewal enabled

# Verify all URLs use HTTPS:
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com
```

### Step 6.2: Configure Security Headers

**Vercel (via vercel.json)**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

**DigitalOcean**: Already configured in your API via security plugins!

### Step 6.3: Rate Limiting Configuration

```bash
# Already implemented in API (apps/api/src/plugins/security.plugin.ts)

# Verify it's working:
for i in {1..150}; do
  curl https://api.yourdomain.com/health
done

# Should return 429 Too Many Requests after ~100 requests
```

### Step 6.4: Rotate Secrets

```bash
# Generate new secrets every 90 days:

# 1. JWT Secret:
openssl rand -base64 48

# 2. Update in both platforms:
# - DigitalOcean: App Settings → Environment Variables
# - Vercel: Project Settings → Environment Variables

# 3. Redeploy both apps
# Note: This invalidates existing user sessions (users must re-login)
```

---

## 📊 Monitoring Setup

### Vercel Built-in Monitoring

```bash
# In Vercel Dashboard:

1. Analytics:
   - Page views
   - Top pages
   - Top referrers
   - Device breakdown
   - Geography

2. Speed Insights:
   - Core Web Vitals
   - Performance score
   - Real user metrics

3. Logs:
   - Function logs
   - Build logs
   - Runtime logs
```

### DigitalOcean Monitoring

```bash
# In DO Dashboard:

1. App Metrics:
   - Request count
   - Response time (p50, p95, p99)
   - Error rate
   - CPU usage
   - Memory usage

2. Database Metrics:
   - Connections
   - Query performance
   - Storage usage

3. Alerts:
   - Set up email/Slack alerts
   - High CPU/memory
   - Error rate spikes
   - Database connection limits
```

### Upstash Redis Monitoring

```bash
# In Upstash Dashboard:

1. Metrics:
   - Command count
   - Hit rate
   - Storage usage
   - Latency

2. Cost tracking:
   - Commands used
   - Data transfer
   - Projected monthly cost
```

### External Monitoring (Recommended)

**1. UptimeRobot (Free)**
```bash
# Monitor both frontend and API:

Frontend Monitor:
- URL: https://yourdomain.com
- Type: HTTPS
- Interval: 5 minutes

API Monitor:
- URL: https://api.yourdomain.com/health
- Type: HTTPS
- Interval: 5 minutes
- Alert if down for > 2 minutes
```

**2. Sentry (Error Tracking)**
```bash
# Add to both frontend and backend:

# 1. Create Sentry account (free: 5K errors/month)
# 2. Create 2 projects:
#    - jobswipe-web (Next.js)
#    - jobswipe-api (Node.js)

# 3. Add DSN to environment variables:

# Vercel:
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/123

# DigitalOcean:
SENTRY_DSN=https://xxx@sentry.io/456

# 4. Errors automatically tracked!
```

---

## 🚨 Rollback Procedures

### Rollback Frontend (Vercel)

```bash
# Option 1: Via Dashboard
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → Promote to Production
4. Takes effect instantly

# Option 2: Via CLI
vercel rollback
# Select deployment to rollback to

# Takes < 10 seconds globally!
```

### Rollback API (DigitalOcean)

```bash
# Via Dashboard:
1. Go to App Platform → Activity
2. Find last successful deployment
3. Click "..." → Rollback
4. Confirm
5. Takes effect in ~1 minute

# Via CLI:
doctl apps deployment rollback <APP_ID> <DEPLOYMENT_ID>
```

### Rollback Database

```bash
# Restore from backup:

1. Go to Database → Backups
2. Select backup
3. Click "Restore"
4. Choose:
   - New cluster (test first) OR
   - Overwrite current (destructive!)
5. Update DATABASE_URL if restored to new cluster
6. Redeploy apps
```

---

## 💰 Cost Optimization

### Free Tiers You Can Use

```bash
✅ Vercel Hobby (Free):
   - 100 GB bandwidth
   - 100 serverless executions/day
   - Automatic HTTPS
   - Limited for production but good for testing

✅ Upstash Free Tier:
   - 10,000 commands/day
   - 256MB storage
   - Perfect for low-traffic apps

✅ DO Credits:
   - $200 credit = ~2 months free
   - Backend + Database + Storage
```

### After Your Credits Run Out

**Month 3+ Costs**:
```bash
Vercel Pro:                $20/month  (needed for production)
DigitalOcean:              $85/month  (API + DB + Storage + Backups)
Upstash Redis:             ~$10/month (based on usage)
Anthropic API:             ~$50/month (based on usage)
──────────────────────────────────────
TOTAL:                     ~$165/month

Compare to single platform: ~$200-250/month
Savings: ~$35-85/month
```

### Tips to Reduce Costs

```bash
1. Use Vercel Image Optimization:
   - Reduces bandwidth
   - Serves optimized formats (WebP, AVIF)
   - Automatic

2. Implement aggressive caching:
   - Redis for API responses
   - Vercel edge caching for static content
   - Reduces API calls and database queries

3. Optimize database queries:
   - Use Prisma's connection pooling
   - Add indexes for common queries
   - Monitor slow queries in DO dashboard

4. Right-size your instances:
   - After 1 week, check metrics
   - If CPU < 30% → Consider smaller instance
   - If memory < 50% → Consider smaller instance

5. Use Upstash's free tier:
   - 10K commands/day is plenty for starting out
   - Monitor usage in dashboard
   - Upgrade only when needed
```

---

## 🔥 Troubleshooting

### Issue: Vercel Build Fails

**Symptoms**: Deployment fails during build

```bash
# Check build logs:
Vercel Dashboard → Deployments → Click failed deployment

# Common issues:

1. Environment variables missing:
   - Add NEXT_PUBLIC_API_URL
   - Add JWT_SECRET if needed

2. Build timeout:
   - Upgrade to Vercel Pro (longer timeouts)
   - Optimize build (remove unused dependencies)

3. Memory limit exceeded:
   - Upgrade instance size
   - Use SWC instead of Babel (Next.js 12+)

# Test build locally:
cd apps/web
npm run build
# If this works locally, issue is with Vercel config
```

### Issue: API Can't Connect to Database

**Symptoms**: 500 errors, "Connection refused"

```bash
# Check DATABASE_URL:
echo $DATABASE_URL
# Must include: ?sslmode=require

# Check DO database:
1. Database Dashboard → Overview
2. Status should be "Online"
3. Connections should be < max

# Check trusted sources:
Database Settings → Trusted Sources
Add: 0.0.0.0/0 (or App Platform IP ranges)

# Test connection:
psql "$DATABASE_URL"
# Should connect successfully
```

### Issue: Redis Connection Fails

**Symptoms**: "Connection timeout", sessions not persisting

```bash
# Check Upstash dashboard:
1. Database status: "Active"
2. Region: Same or close to API

# Check REDIS_URL format:
redis://default:password@host:6379

# Test connection:
redis-cli -u "$REDIS_URL" ping
# Should return: PONG

# Check firewall:
Upstash allows all IPs by default
No configuration needed
```

### Issue: CORS Errors in Browser

**Symptoms**: "Access-Control-Allow-Origin" error

```bash
# Check API CORS configuration:

1. Verify environment variable:
API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

2. Verify frontend domain is included

3. Check API logs:
DO App Platform → Logs
Search for "CORS"

# Test CORS:
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.yourdomain.com/api/v1/auth/login

# Should return Access-Control-Allow-Origin header
```

### Issue: Images Not Loading from Spaces

**Symptoms**: 403 Forbidden or CORS error

```bash
# Check Spaces configuration:

1. CORS settings:
   - Allow origin: your domain
   - Allow methods: GET, PUT, POST

2. File permissions:
   - Files should be public OR
   - Use signed URLs in API

3. CDN enabled:
   - Spaces Settings → Enable CDN
   - Reduces latency

# Test direct access:
curl -I https://jobswipe-production-resumes.nyc3.digitaloceanspaces.com/test.pdf
# Should return 200 or 403 (if private)
```

---

## ✅ Final Pre-Launch Checklist

### Infrastructure
- [ ] Upstash Redis created and tested
- [ ] DO PostgreSQL deployed and migrated
- [ ] DO Spaces created and CORS configured
- [ ] All API keys obtained (Anthropic, OpenAI)

### Backend (DigitalOcean)
- [ ] API deployed and health checks passing
- [ ] Environment variables set correctly
- [ ] Database migrations completed
- [ ] Redis connection working
- [ ] File uploads working (test resume upload)

### Frontend (Vercel)
- [ ] Web app deployed and accessible
- [ ] Environment variables set
- [ ] API connection working
- [ ] User registration working
- [ ] User login working
- [ ] Jobs loading correctly
- [ ] Swipe functionality working

### Domains & SSL
- [ ] Custom domains added (frontend + API)
- [ ] DNS configured and propagated
- [ ] SSL certificates active (automatic)
- [ ] HTTPS enforced everywhere

### Security
- [ ] CORS configured correctly
- [ ] Rate limiting tested
- [ ] Security headers active
- [ ] Secrets rotated from defaults
- [ ] Input validation working

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] DO monitoring configured
- [ ] Uptime monitors set up (UptimeRobot)
- [ ] Error tracking configured (Sentry)
- [ ] Alert notifications tested

### Backups
- [ ] Database backups enabled (daily)
- [ ] Backup retention configured (7-30 days)
- [ ] Test restore procedure

---

## 🎉 Launch Day Protocol

### T-24 Hours: Final Preparations
```bash
✅ All checklist items completed
✅ Team briefed
✅ Monitoring dashboards open
✅ Support ready
✅ Rollback plan reviewed
```

### T-1 Hour: Final Tests
```bash
# Test complete user flow:
1. Open https://yourdomain.com
2. Register new account
3. Verify email (if implemented)
4. Login
5. Browse jobs
6. Swipe right on job
7. Check application queue (should be queued)
8. Test desktop app connection (if available)

# Check all systems green:
- Vercel deployment: Healthy
- DO API: Healthy
- Database: < 50% connections
- Redis: Connected
- Monitoring: Active
```

### T-0: LAUNCH! 🚀
```bash
1. Remove any maintenance pages
2. Send announcement
3. Monitor for first 2 hours:
   - Watch error logs (Sentry)
   - Check response times (Vercel/DO dashboards)
   - Monitor database connections
   - Track user registrations
   - Verify automation working
```

### T+1 Hour: First Check-in
```bash
# Review metrics:
- New users registered: ?
- API error rate: < 1% ✅
- Response time p95: < 500ms ✅
- Database connections: < 50% ✅
- No critical errors ✅
```

### T+24 Hours: First Review
```bash
# Comprehensive review:
- Total users: ?
- Total jobs viewed: ?
- Total applications: ?
- Automation success rate: ?
- Cost tracking: On budget? ✅
- User feedback: Any issues?
```

---

## 📞 Support Resources

### Platform Support

```bash
# Vercel Support:
- Community: https://github.com/vercel/vercel/discussions
- Docs: https://vercel.com/docs
- Email: support@vercel.com (Pro plan)
- Status: https://www.vercel-status.com

# DigitalOcean Support:
- Community: https://www.digitalocean.com/community
- Docs: https://docs.digitalocean.com
- Tickets: https://cloud.digitalocean.com/support
- Status: https://status.digitalocean.com

# Upstash Support:
- Discord: https://discord.gg/upstash
- Docs: https://docs.upstash.com
- Email: support@upstash.com
- Status: https://status.upstash.com
```

---

## 🎯 Success Metrics

### Week 1 Goals
```
✅ 99.9% uptime (both frontend & API)
✅ < 1% error rate
✅ < 400ms frontend p95 (Vercel)
✅ < 500ms API p95 (DO)
✅ 100+ user registrations
✅ 500+ job views
✅ 50+ applications
✅ 0 security incidents
```

### Month 1 Goals
```
✅ 99.95% uptime
✅ < 0.5% error rate
✅ 1,000+ active users
✅ 10,000+ job views
✅ 1,000+ applications
✅ 70%+ automation success rate
✅ < $200/month costs (with credits)
```

---

## 🌟 Why This Setup is Optimal

### Advantages Summary

**Vercel for Frontend:**
- ✅ Best Next.js performance in the world
- ✅ Global edge network (instant page loads worldwide)
- ✅ Automatic image optimization (saves bandwidth)
- ✅ Perfect developer experience
- ✅ Analytics included

**DigitalOcean for Backend:**
- ✅ Use your $200 credits (~2 months free)
- ✅ Simple, transparent pricing
- ✅ Excellent managed database
- ✅ Easy to scale
- ✅ Great community support

**Upstash for Redis:**
- ✅ Serverless (pay only for what you use)
- ✅ Free tier (10K commands/day)
- ✅ Better than DO's discontinued service
- ✅ Global replication available
- ✅ REST API (works everywhere)

**No Docker:**
- ✅ Faster deployments
- ✅ Less complexity
- ✅ Platform-optimized builds
- ✅ Easier debugging
- ✅ Auto-scaling built-in

---

## 🚀 You're Ready to Deploy!

This hybrid setup gives you:
- ✅ **Best performance** for each component
- ✅ **Cost optimization** ($165/month vs $200+ single platform)
- ✅ **Use your DO credits** (2 months free!)
- ✅ **No Docker complexity** (platform auto-builds)
- ✅ **Professional infrastructure** (used by major companies)
- ✅ **Easy scaling** (click to upgrade resources)

**Start with Phase 1 and follow each step carefully. You've got this!** 💪

---

*Last Updated: 2025-11-10*
*Version: 1.0*
*Strategy: Hybrid Multi-Platform*
*Prepared by: DevOps CTO*
