# 🌊 DigitalOcean Production Deployment Guide
## Leveraging Your DigitalOcean Credits for JobSwipe Deployment

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Prepared By:** DevOps CTO
**Platform:** DigitalOcean
**Estimated Timeline:** 3-4 hours

---

## 📋 Executive Summary

This guide shows you how to deploy JobSwipe on **DigitalOcean** infrastructure, maximizing your existing credits. DigitalOcean offers a perfect balance of simplicity, cost-effectiveness, and control.

### Why DigitalOcean is Great for JobSwipe

✅ **Cost-Effective**: Use your credits, then ~$100-150/month
✅ **All-in-One**: Database, Redis, App Platform, Storage in one account
✅ **Simple Pricing**: No surprise bills, transparent costs
✅ **Great Performance**: SSD storage, fast network
✅ **Easy Scaling**: Vertical and horizontal scaling available

---

## 🏗️ DigitalOcean Architecture

```
┌─────────────────────────────────────────────────────────┐
│              DigitalOcean Infrastructure                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌─────────────────┐         │
│  │   App Platform   │      │  App Platform   │         │
│  │   (Web - Next.js)│◄────►│  (API - Fastify)│         │
│  │   Auto-scaling   │      │  Auto-scaling   │         │
│  └──────────────────┘      └────────┬────────┘         │
│           ▲                         │                   │
│           │                         ▼                   │
│           │                  ┌─────────────┐            │
│           │                  │  Managed    │            │
│           │                  │ PostgreSQL  │            │
│           │                  │  (Primary)  │            │
│           │                  └─────────────┘            │
│           │                         ▲                   │
│  ┌────────┴─────────┐       ┌──────┴──────┐            │
│  │     Droplet      │       │   Managed   │            │
│  │  (Desktop App)   │◄─────►│    Redis    │            │
│  │  Ubuntu 22.04    │       │  (Cache)    │            │
│  └──────────────────┘       └─────────────┘            │
│           │                                             │
│           ▼                                             │
│  ┌──────────────────┐                                  │
│  │     Spaces       │                                  │
│  │  (S3-compatible) │                                  │
│  │   File Storage   │                                  │
│  └──────────────────┘                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown with DigitalOcean

### Option 1: App Platform Setup (~$112/month after credits)

```
App Platform (API):           $12/month   (Basic tier)
App Platform (Web):           $12/month   (Basic tier)
Managed Database (PostgreSQL): $55/month  (2GB RAM, 25GB storage)
Managed Redis:                $15/month   (1GB RAM)
Spaces (Storage):             $5/month    (250GB included)
Domain + SSL:                 Free        (Included)
Bandwidth:                    Included    (1TB free)
──────────────────────────────────────────────────────
SUBTOTAL:                     $99/month
Backup costs:                 +$13/month  (database backups)
──────────────────────────────────────────────────────
TOTAL:                        $112/month

With $200 credits:            First ~2 months FREE!
```

### Option 2: Droplet Setup (~$70/month after credits)

```
Droplet (API + Web):          $24/month   (4GB RAM, 2 vCPU)
Managed Database:             $55/month   (PostgreSQL)
Managed Redis:                $15/month   (1GB RAM)
Spaces:                       $5/month    (Storage)
──────────────────────────────────────────────────────
TOTAL:                        $99/month

With $200 credits:            First ~2 months FREE!
```

### Recommendation: **Option 1 (App Platform)**
- Easier deployment
- Auto-scaling included
- Automatic SSL/HTTPS
- Built-in monitoring
- Zero-downtime deployments

---

## 🚀 DEPLOYMENT STRATEGY: App Platform (Recommended)

### What is App Platform?

Think of it as DigitalOcean's version of Heroku/Vercel:
- Push code → Automatic build → Automatic deploy
- Built-in CI/CD
- Free SSL certificates
- Auto-scaling
- Easy rollbacks

---

## 📝 STEP-BY-STEP: Complete Deployment

### Prerequisites Checklist

- [ ] DigitalOcean account with credits
- [ ] GitHub account (for code deployment)
- [ ] Domain name (optional but recommended)
- [ ] API keys ready (Anthropic, OpenAI)
- [ ] 3-4 hours of focused time

---

## Phase 1: Set Up DigitalOcean Infrastructure (60 min)

### Step 1.1: Create Managed PostgreSQL Database (15 min)

```bash
# Via DigitalOcean Dashboard:

1. Go to https://cloud.digitalocean.com/databases
2. Click "Create Database Cluster"
3. Configuration:
   - Engine: PostgreSQL 16
   - Plan: Basic ($55/month - 2GB RAM)
   - Datacenter: Choose closest to your users (e.g., NYC1, SFO3)
   - Database name: jobswipe-production
   - Create cluster

4. Wait for provisioning (5-10 minutes)

5. Once ready, go to "Connection Details"
   - Copy "Connection String"
   - Example format:
     postgresql://doadmin:password@db-postgresql-nyc1-12345.ondigitalocean.com:25060/defaultdb?sslmode=require

6. Create application database:
   - Click "Users & Databases" tab
   - Create new database: "jobswipe_prod"
   - Create new user: "jobswipe_app" (optional, for security)

7. Update connection string:
   postgresql://jobswipe_app:password@host:25060/jobswipe_prod?sslmode=require
```

**🎯 Action**: Copy and save your `DATABASE_URL`

**Important Configuration**:
```bash
# In Database Settings:
✅ Enable "Trusted Sources" - Add your IP for testing
✅ Enable "Automatic Backups" - Daily backups
✅ Set "Connection Pools" - Max 25 connections
✅ Enable "Standby Nodes" (optional, for high availability)
```

### Step 1.2: Create Managed Redis (10 min)

```bash
# Via DigitalOcean Dashboard:

1. Go to https://cloud.digitalocean.com/databases
2. Click "Create Database Cluster"
3. Configuration:
   - Engine: Redis 7
   - Plan: Basic ($15/month - 1GB RAM)
   - Datacenter: Same as PostgreSQL (important!)
   - Cluster name: jobswipe-redis
   - Create cluster

4. Wait for provisioning (3-5 minutes)

5. Connection Details:
   - Copy "Connection String"
   - Format: redis://default:password@host:25061
   - OR use: rediss://default:password@host:25061 (with TLS)

6. Configuration:
   - Enable "Eviction Policy": allkeys-lru (recommended)
   - Set "Max Memory": 950MB (leave 50MB buffer)
```

**🎯 Action**: Copy and save your `REDIS_URL`

### Step 1.3: Create Spaces (S3-Compatible Storage) (10 min)

```bash
# Via DigitalOcean Dashboard:

1. Go to https://cloud.digitalocean.com/spaces
2. Click "Create a Space"
3. Configuration:
   - Region: Same as your database (e.g., NYC3)
   - Enable CDN: Yes (recommended)
   - Space name: jobswipe-production-resumes
   - File Listing: Private (Restricted)
   - Create Space

4. Generate Access Keys:
   - Go to API → Spaces Keys
   - Click "Generate New Key"
   - Name: jobswipe-production
   - Copy Access Key ID and Secret Key immediately!

5. CORS Configuration:
   - In Space Settings → CORS Configurations
   - Add CORS Rule:
```

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://yourdomain.com</AllowedOrigin>
    <AllowedOrigin>https://www.yourdomain.com</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

**🎯 Actions**: Save these values:
```bash
SPACES_ACCESS_KEY_ID="DO00..."
SPACES_SECRET_ACCESS_KEY="..."
SPACES_ENDPOINT="https://nyc3.digitaloceanspaces.com"
SPACES_BUCKET="jobswipe-production-resumes"
SPACES_REGION="nyc3"
```

### Step 1.4: Configure Environment Variables File (25 min)

Create a secure file to store all your environment variables:

```bash
# Create .env.production file locally:

# ============================================================================
# DATABASE (DigitalOcean Managed PostgreSQL)
# ============================================================================
DATABASE_URL="postgresql://jobswipe_app:PASSWORD@db-host.ondigitalocean.com:25060/jobswipe_prod?sslmode=require"

# ============================================================================
# REDIS (DigitalOcean Managed Redis)
# ============================================================================
REDIS_URL="redis://default:PASSWORD@redis-host.ondigitalocean.com:25061"

# ============================================================================
# STORAGE (DigitalOcean Spaces - S3 Compatible)
# ============================================================================
AWS_ACCESS_KEY_ID="DO00..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="nyc3"
AWS_S3_BUCKET="jobswipe-production-resumes"
AWS_ENDPOINT="https://nyc3.digitaloceanspaces.com"
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"

# ============================================================================
# JWT SECRETS (Generate unique values!)
# ============================================================================
JWT_SECRET="GENERATE_WITH: openssl rand -base64 48"
JWT_REFRESH_SECRET="GENERATE_WITH: openssl rand -base64 48"
SESSION_SECRET="GENERATE_WITH: openssl rand -base64 32"
CSRF_SECRET="GENERATE_WITH: openssl rand -base64 32"

# ============================================================================
# AI SERVICES
# ============================================================================
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
GOOGLE_API_KEY="..."

# ============================================================================
# APPLICATION SETTINGS
# ============================================================================
NODE_ENV="production"
API_PORT="8080"
API_HOST="0.0.0.0"

# ============================================================================
# CORS & SECURITY
# ============================================================================
API_CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# ============================================================================
# MONITORING
# ============================================================================
LOG_LEVEL="info"
MONITORING_ENABLED="true"

# ============================================================================
# RATE LIMITING
# ============================================================================
RATE_LIMIT_MAX_REQUESTS="500"
RATE_LIMIT_WINDOW="900000"
```

**Generate Secrets**:
```bash
# On your local machine:
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "CSRF_SECRET=$(openssl rand -base64 32)"

# Save these outputs to your .env.production file
```

---

## Phase 2: Prepare Your Repository (30 min)

### Step 2.1: Push Code to GitHub

```bash
# If not already on GitHub:
cd /home/user/jobswipe

# Create GitHub repository (via GitHub.com):
# 1. Go to https://github.com/new
# 2. Name: jobswipe (or your preferred name)
# 3. Private repository (recommended)
# 4. Don't initialize with README (you already have code)

# Add remote and push:
git remote add origin https://github.com/YOUR_USERNAME/jobswipe.git
git branch -M main
git push -u origin main

# Verify code is on GitHub
```

### Step 2.2: Create App Platform Configuration

Create `.do/app.yaml` in your repository root:

```yaml
# .do/app.yaml
name: jobswipe-production
region: nyc

# API Service
services:
  - name: api
    github:
      repo: YOUR_USERNAME/jobswipe
      branch: main
      deploy_on_push: true

    source_dir: /apps/api

    build_command: |
      cd /workspace/jobswipe
      npm install -g pnpm
      pnpm install --frozen-lockfile
      cd apps/api
      pnpm run build:production

    run_command: |
      cd apps/api
      node dist/index.js

    environment_slug: node-js

    instance_count: 1
    instance_size_slug: basic-xs  # $12/month

    http_port: 8080

    health_check:
      http_path: /health
      initial_delay_seconds: 60
      period_seconds: 10
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 3

    routes:
      - path: /

    envs:
      - key: NODE_ENV
        value: production

      - key: API_PORT
        value: "8080"

      - key: API_HOST
        value: "0.0.0.0"

      # Add all other environment variables from .env.production
      # These will be added via Dashboard for security

      - key: DATABASE_URL
        scope: RUN_TIME
        type: SECRET

      - key: REDIS_URL
        scope: RUN_TIME
        type: SECRET

      - key: JWT_SECRET
        scope: RUN_TIME
        type: SECRET

# Web App Service
  - name: web
    github:
      repo: YOUR_USERNAME/jobswipe
      branch: main
      deploy_on_push: true

    source_dir: /apps/web

    build_command: |
      cd /workspace/jobswipe
      npm install -g pnpm
      pnpm install --frozen-lockfile
      cd apps/web
      pnpm run build

    environment_slug: node-js

    instance_count: 1
    instance_size_slug: basic-xs  # $12/month

    http_port: 3000

    routes:
      - path: /

    envs:
      - key: NODE_ENV
        value: production

      - key: NEXT_PUBLIC_API_URL
        value: "${api.PUBLIC_URL}"
```

**Commit this file**:
```bash
git add .do/app.yaml
git commit -m "feat: Add DigitalOcean App Platform configuration"
git push origin main
```

---

## Phase 3: Deploy API to App Platform (45 min)

### Step 3.1: Run Database Migrations

**Before deploying the app, set up the database schema**:

```bash
# On your local machine:

# 1. Install dependencies
cd /home/user/jobswipe
npm install

# 2. Set DATABASE_URL to your DigitalOcean database
export DATABASE_URL="postgresql://jobswipe_app:PASSWORD@db-host:25060/jobswipe_prod?sslmode=require"

# 3. Generate Prisma Client
npm run db:generate

# 4. Deploy migrations
cd packages/database
npx prisma migrate deploy

# Expected output:
# ✅ 5 migrations found
# ✅ 0 migrations already applied
# ✅ 5 migrations to apply
# ✅ Migration applied: 20251013070801_add_onboarding_fields
# ✅ Migration applied: 20251109023003_add_greenhouse_scraper_fields
# ✅ All migrations applied successfully

# 5. Verify database
npx prisma studio
# Check that all tables exist: users, companies, job_postings, etc.
```

### Step 3.2: Create App Platform Application

```bash
# Via DigitalOcean Dashboard:

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"

3. Choose Source:
   - Select "GitHub"
   - Authorize DigitalOcean to access your GitHub
   - Select repository: jobswipe
   - Select branch: main
   - Autodeploy: Enable (deploys on git push)
   - Next

4. Configure Resources:
   - DigitalOcean will detect your .do/app.yaml
   - Review configuration
   - Edit if needed
   - Next

5. Environment Variables:
   - Click "Edit" on API service
   - Go to "Environment Variables"
   - Add ALL variables from your .env.production:
```

**Critical Variables to Add**:
```bash
DATABASE_URL                = postgresql://...
REDIS_URL                   = redis://...
JWT_SECRET                  = your-generated-secret
JWT_REFRESH_SECRET          = your-generated-secret
SESSION_SECRET              = your-generated-secret
CSRF_SECRET                 = your-generated-secret
AWS_ACCESS_KEY_ID           = DO00...
AWS_SECRET_ACCESS_KEY       = ...
AWS_REGION                  = nyc3
AWS_S3_BUCKET              = jobswipe-production-resumes
AWS_ENDPOINT               = https://nyc3.digitaloceanspaces.com
ANTHROPIC_API_KEY          = sk-ant-...
OPENAI_API_KEY             = sk-...
API_CORS_ORIGIN            = https://yourdomain.com
RATE_LIMIT_MAX_REQUESTS    = 500
LOG_LEVEL                  = info
```

```bash
6. Info:
   - App name: jobswipe-production
   - Region: NYC (or your chosen region)
   - Next

7. Review:
   - Review all settings
   - Estimated cost: ~$24/month for both services
   - Create Resources

8. Wait for deployment (10-15 minutes)
   - Watch build logs in real-time
   - First deployment takes longer (installing dependencies)
```

### Step 3.3: Monitor First Deployment

```bash
# In App Platform Dashboard:

1. Click on your app: jobswipe-production
2. Go to "Activity" tab
3. Click on active deployment
4. Watch logs:

Expected logs:
✅ Cloning repository
✅ Installing pnpm
✅ Installing dependencies
✅ Building application
✅ Starting application
✅ Health check passing
✅ Deployment successful

# If errors occur, check:
- Build logs for dependency issues
- Runtime logs for startup errors
- Environment variables are set correctly
```

### Step 3.4: Test API Deployment

```bash
# Get your App URL from dashboard (example):
# https://api-jobswipe-production-abc123.ondigitalocean.app

# Test health endpoint:
curl https://your-api-url.ondigitalocean.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "uptime": 123
}

# Test detailed health:
curl https://your-api-url.ondigitalocean.app/health/detailed

# Should show:
{
  "status": "healthy",
  "timestamp": "...",
  "database": "connected",
  "redis": "connected",
  "uptime": 123
}

# Test API info:
curl https://your-api-url.ondigitalocean.app/api/v1/info

# Test registration:
curl -X POST https://your-api-url.ondigitalocean.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "name": "Test User"
  }'

# Should return user object with token
```

---

## Phase 4: Deploy Web App to App Platform (30 min)

### Step 4.1: Configure Web App Environment

The web app needs to know the API URL:

```bash
# In App Platform Dashboard:

1. Go to your app: jobswipe-production
2. Click on "web" service
3. Settings → Environment Variables
4. Add:

NEXT_PUBLIC_API_URL         = ${api.PUBLIC_URL}
NEXT_PUBLIC_APP_URL         = https://yourdomain.com
JWT_SECRET                  = (same as API)
DATABASE_URL                = (same as API - if web needs DB access)

5. Save changes
6. Trigger manual deploy (or push to GitHub)
```

### Step 4.2: Test Web App

```bash
# Get Web App URL from dashboard:
# https://web-jobswipe-production-xyz789.ondigitalocean.app

# Open in browser:
open https://your-web-url.ondigitalocean.app

# Test functionality:
✅ Homepage loads
✅ Can navigate to login/register
✅ Can register new account
✅ Can login
✅ Can see jobs list
✅ Can swipe on jobs
✅ Can view profile
```

---

## Phase 5: Configure Custom Domain (20 min)

### Step 5.1: Add Domain to App Platform

```bash
# In App Platform Dashboard:

1. Go to Settings → Domains
2. Click "Add Domain"

3. For API:
   - Domain: api.yourdomain.com
   - Service: api
   - Add domain

4. For Web:
   - Domain: yourdomain.com
   - Service: web
   - Add domain

   - Also add: www.yourdomain.com
   - Service: web
   - Add domain
```

### Step 5.2: Configure DNS

```bash
# In your domain registrar (e.g., Namecheap, GoDaddy):

1. Add CNAME records:

   Type    Name    Value                               TTL
   ─────────────────────────────────────────────────────────
   CNAME   api     api-jobswipe-abc.ondigitalocean.app  300
   CNAME   www     web-jobswipe-xyz.ondigitalocean.app  300
   CNAME   @       web-jobswipe-xyz.ondigitalocean.app  300

   # OR use A records (get IPs from DigitalOcean):
   Type    Name    Value           TTL
   ────────────────────────────────────
   A       @       143.198.xxx.xxx  300
   A       www     143.198.xxx.xxx  300
   A       api     143.198.xxx.xxx  300

2. Save changes
3. Wait for DNS propagation (5-30 minutes)
```

### Step 5.3: Enable SSL

```bash
# In App Platform Dashboard:

1. Go to Settings → Domains
2. For each domain, click "Manage"
3. SSL Certificate: Enable (automatic via Let's Encrypt)
4. Wait for certificate provisioning (5-10 minutes)

# Verify HTTPS:
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

---

## Phase 6: Desktop App Configuration (Optional - 20 min)

The desktop app connects to your API, so update the configuration:

### Step 6.1: Update API Endpoint

```bash
# Edit apps/desktop/src/config.ts or environment:

export const config = {
  apiUrl: process.env.API_URL || 'https://api.yourdomain.com',
  // ... other config
}
```

### Step 6.2: Rebuild Desktop App

```bash
cd apps/desktop

# Update package.json with production API URL
npm run build

# Package for distribution
npm run package:mac      # macOS
npm run package:win      # Windows
npm run package:linux    # Linux
```

### Step 6.3: Distribute to Users

```bash
# Option A: Direct Download
# 1. Upload built packages to DigitalOcean Spaces
# 2. Create public links
# 3. Share with users

# Option B: GitHub Releases
# 1. Create release on GitHub
# 2. Upload installers
# 3. Users download from releases page

# Built files location:
apps/desktop/dist-electron/
```

---

## Phase 7: Database Backups & Monitoring (30 min)

### Step 7.1: Enable Automated Backups

```bash
# In Database Dashboard:

1. Go to your PostgreSQL cluster
2. Settings → Backups
3. Configure:
   - Daily backups: Enabled
   - Retention: 7 days (free) or 30 days (+$13/month)
   - Backup time: Choose low-traffic hours (e.g., 3 AM)
4. Save

# Test manual backup:
1. Go to Backups tab
2. Click "Create Backup"
3. Wait for completion
4. Verify backup exists
```

### Step 7.2: Set Up Monitoring Alerts

```bash
# In DigitalOcean Dashboard:

1. Go to Monitoring → Alerts
2. Create Alert Policies:

Alert 1: High CPU Usage
- Resource: API app
- Metric: CPU
- Threshold: > 80% for 5 minutes
- Notification: Email

Alert 2: High Memory Usage
- Resource: API app
- Metric: Memory
- Threshold: > 85% for 5 minutes
- Notification: Email

Alert 3: Database Connections
- Resource: PostgreSQL
- Metric: Connection count
- Threshold: > 20 (80% of 25 max)
- Notification: Email

Alert 4: High Response Time
- Resource: API app
- Metric: Response time
- Threshold: > 2000ms average for 5 minutes
- Notification: Email

Alert 5: Deployment Failures
- Resource: App Platform
- Event: Deployment failed
- Notification: Email + Slack (if configured)
```

### Step 7.3: Configure Log Forwarding (Optional)

```bash
# Forward logs to external service:

1. Go to App Platform → Settings → Logs
2. Configure log forwarding:
   - Destination: Papertrail, Logtail, or custom
   - Add forwarding rule
   - Test connection

# Or use DigitalOcean built-in logs:
1. Go to App Platform → Logs
2. Filter by service (api, web)
3. Search and analyze logs
4. Set up log-based alerts
```

---

## 🔒 Security Hardening

### Step 8.1: Enable Firewall

```bash
# In DigitalOcean Dashboard:

1. Go to Networking → Firewalls
2. Create Firewall: "jobswipe-production"
3. Inbound Rules:
   - HTTP (80): All IPv4, All IPv6
   - HTTPS (443): All IPv4, All IPv6
   - PostgreSQL (25060): Only from App Platform IPs
   - Redis (25061): Only from App Platform IPs

4. Outbound Rules:
   - All TCP: All destinations (for API calls)
   - All UDP: All destinations (for DNS)

5. Apply to:
   - Database cluster
   - Redis cluster
   - (App Platform has built-in firewall)
```

### Step 8.2: Enable VPC (Optional but Recommended)

```bash
# Create Virtual Private Cloud:

1. Go to Networking → VPC
2. Create VPC: "jobswipe-vpc"
3. Region: Same as your resources
4. IP range: 10.108.0.0/20 (default)

5. Move resources to VPC:
   - Database cluster
   - Redis cluster
   - App Platform apps

# Benefits:
- Private network communication
- No public internet for internal traffic
- Better security and performance
```

### Step 8.3: Rotate Secrets Regularly

```bash
# Every 90 days, rotate:

1. JWT_SECRET
   - Generate new secret: openssl rand -base64 48
   - Update in App Platform environment variables
   - Redeploy app
   - Old tokens become invalid (users re-login)

2. Database password
   - DigitalOcean dashboard → Database → Users
   - Reset password for jobswipe_app user
   - Update DATABASE_URL in App Platform
   - Redeploy

3. Redis password
   - Similar to database

4. API keys
   - Anthropic, OpenAI dashboards
   - Rotate keys
   - Update environment variables
```

---

## 📊 Monitoring & Observability

### Built-in DigitalOcean Monitoring

```bash
# Dashboard locations:

1. App Platform Metrics:
   - https://cloud.digitalocean.com/apps/YOUR_APP_ID
   - Metrics tab shows:
     ✅ Request count
     ✅ Response time (p50, p95, p99)
     ✅ Error rate
     ✅ CPU usage
     ✅ Memory usage
     ✅ Bandwidth

2. Database Metrics:
   - https://cloud.digitalocean.com/databases/YOUR_DB_ID
   - Metrics show:
     ✅ Connection count
     ✅ Query rate
     ✅ CPU usage
     ✅ Memory usage
     ✅ Disk usage

3. Redis Metrics:
   - Similar dashboard for Redis
   - Shows cache hit rate, memory usage, etc.
```

### External Monitoring (Recommended)

#### Option 1: UptimeRobot (Free)

```bash
1. Go to https://uptimerobot.com
2. Create account
3. Add monitors:

Monitor 1: API Health
- Type: HTTPS
- URL: https://api.yourdomain.com/health
- Interval: 5 minutes
- Alert when down

Monitor 2: Web App
- Type: HTTPS
- URL: https://yourdomain.com
- Interval: 5 minutes
- Alert when down

Monitor 3: API Response Time
- Type: HTTPS
- URL: https://api.yourdomain.com/api/v1/info
- Interval: 5 minutes
- Alert if > 2000ms
```

#### Option 2: Sentry (Error Tracking)

```bash
1. Go to https://sentry.io
2. Create account (free tier: 5,000 errors/month)
3. Create project: jobswipe-api
4. Get DSN: https://xxx@sentry.io/123456
5. Add to environment variables:

SENTRY_DSN="https://xxx@sentry.io/123456"

6. Redeploy app
7. Errors will appear in Sentry dashboard
```

---

## 🚨 Rollback Procedures

### Scenario 1: Bad Deployment

```bash
# App Platform makes this easy:

1. Go to App Platform → Activity
2. Find last successful deployment
3. Click "..." menu → Rollback
4. Confirm rollback
5. Takes effect in < 1 minute

# Or via CLI:
doctl apps list
doctl apps deployment list <APP_ID>
doctl apps deployment rollback <APP_ID> <DEPLOYMENT_ID>
```

### Scenario 2: Database Issue

```bash
# Restore from backup:

1. Go to Database → Backups
2. Select backup to restore
3. Click "Restore"
4. Choose:
   - Restore to new cluster (recommended for testing)
   - OR overwrite current cluster (destructive!)
5. Update DATABASE_URL in App Platform
6. Redeploy apps
```

### Scenario 3: Environment Variable Mistake

```bash
# Fix without redeploying:

1. Go to App Platform → Settings → Environment Variables
2. Edit the incorrect variable
3. Click "Save"
4. Trigger manual deploy (or push to git)

# Takes effect on next deployment
```

### Scenario 4: Complete Failure

```bash
# Emergency maintenance mode:

1. Create maintenance.html page
2. Upload to Spaces
3. Set up redirect in App Platform
4. Debug in separate staging app
5. Deploy fix
6. Remove maintenance page
```

---

## 💰 Cost Optimization Tips

### Reduce Costs After Launch

```bash
# 1. Right-size your instances
# After 1 week, check metrics:
- If CPU < 30% → Downgrade instance size
- If memory < 50% → Downgrade instance size

# 2. Use connection pooling
# Already configured in Prisma
# Reduces database connections = cheaper tier

# 3. Enable Redis caching aggressively
# Reduce database queries = cheaper database tier

# 4. Use Spaces CDN
# Serve static assets from CDN
# Reduces bandwidth costs

# 5. Archive old data
# Move old job postings to cold storage
# Reduces database size

# 6. Use spot instances for workers (future)
# DigitalOcean doesn't have spot instances
# But you can use Kubernetes for cost optimization
```

### Using Your Credits Wisely

```bash
# $200 credit breakdown:

Month 1:
- Infrastructure: $112
- Remaining: $88

Month 2:
- Infrastructure: $112
- Use remaining $88
- Out of credits after ~1.8 months

# Tip: Use credits to test and optimize
# Then switch to monthly billing when credits run out
```

---

## 🎯 Post-Deployment Checklist

### Immediate (First 24 Hours)

- [ ] API health endpoint responding
- [ ] Web app loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Jobs load correctly
- [ ] Swipe functionality works
- [ ] Database connections stable
- [ ] Redis connections stable
- [ ] Monitoring alerts configured
- [ ] Backup schedule verified
- [ ] SSL certificates active
- [ ] Custom domain working
- [ ] Error tracking configured

### Week 1

- [ ] Review error logs daily
- [ ] Monitor response times
- [ ] Check database performance
- [ ] Review Redis cache hit rate
- [ ] Test automation features
- [ ] Gather initial user feedback
- [ ] Optimize slow queries
- [ ] Review and adjust rate limits

### Week 2-4

- [ ] Analyze user behavior patterns
- [ ] Optimize API endpoints
- [ ] Review infrastructure costs
- [ ] Plan for scaling
- [ ] Set up staging environment
- [ ] Document common issues
- [ ] Train support team

---

## 🔥 Troubleshooting Guide

### Issue: Build Fails in App Platform

**Symptoms**: Deployment fails during build step

**Solutions**:
```bash
# 1. Check build logs
App Platform → Activity → Click on failed deployment → View logs

# Common issues:
# - Missing dependency: Add to package.json
# - Build timeout: Increase build resources in .do/app.yaml
# - Environment variable missing: Add in Settings

# 2. Test build locally
cd apps/api
npm run build

# 3. Check build command in .do/app.yaml
# Ensure paths are correct

# 4. Clear build cache
Settings → Advanced → Clear build cache
```

### Issue: Database Connection Failed

**Symptoms**: App crashes with "Connection refused" or timeout

**Solutions**:
```bash
# 1. Check DATABASE_URL format
# Must include sslmode=require for DigitalOcean
postgresql://user:pass@host:25060/db?sslmode=require

# 2. Check trusted sources
Database → Settings → Trusted Sources
Add: 0.0.0.0/0 (or specific App Platform IPs)

# 3. Check connection pool
# Max 25 connections on basic plan
# Prisma should handle pooling automatically

# 4. Test connection from local
psql "postgresql://user:pass@host:25060/db?sslmode=require"
```

### Issue: Redis Connection Timeout

**Symptoms**: Sessions not persisting, queue not working

**Solutions**:
```bash
# 1. Check REDIS_URL format
redis://default:password@host:25061

# 2. Check Redis is running
Database dashboard → Redis → Overview
Status should be "Online"

# 3. Check connection from app logs
App Platform → Logs → Search for "redis"

# 4. Test connection locally
redis-cli -u redis://default:pass@host:25061 ping
# Should return: PONG
```

### Issue: Spaces Upload Fails

**Symptoms**: Resume upload returns 403 or 500 error

**Solutions**:
```bash
# 1. Check Spaces keys
# Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

# 2. Check bucket permissions
Spaces → Settings → Permissions
Should allow PutObject, GetObject

# 3. Check CORS configuration
Spaces → Settings → CORS
Must allow your domain

# 4. Check endpoint URL
AWS_ENDPOINT="https://nyc3.digitaloceanspaces.com"
# Must match your region (nyc3, sfo3, etc.)

# 5. Test upload with AWS CLI
aws s3 cp test.pdf s3://your-bucket/test.pdf \
  --endpoint-url https://nyc3.digitaloceanspaces.com
```

### Issue: App Platform Out of Memory

**Symptoms**: App crashes with "JavaScript heap out of memory"

**Solutions**:
```bash
# 1. Upgrade instance size
Settings → Resources → Edit service
Change from basic-xs to basic-s or basic-m

# 2. Optimize code
# Check for memory leaks
# Use streaming for large files
# Implement pagination

# 3. Add memory limit
# In .do/app.yaml:
instance_size_slug: basic-m  # 2GB RAM

# 4. Monitor memory usage
Metrics tab → Memory graph
Should stay below 80% consistently
```

---

## 📞 Support Resources

### DigitalOcean Support

```bash
# Community Support (Free):
https://www.digitalocean.com/community/questions

# Ticket Support (Account holders):
https://cloud.digitalocean.com/support/tickets

# Documentation:
https://docs.digitalocean.com/

# Status Page:
https://status.digitalocean.com/

# Response times:
- Free accounts: 24-48 hours
- Paid accounts: 12-24 hours
- Premium support: < 4 hours (add-on)
```

### Critical Service Status Pages

```bash
DigitalOcean:     https://status.digitalocean.com
Anthropic:        https://status.anthropic.com
OpenAI:           https://status.openai.com
GitHub:           https://www.githubstatus.com
```

---

## ✅ Final Deployment Checklist

### Pre-Launch
- [ ] DigitalOcean account created with credits
- [ ] Managed PostgreSQL deployed and tested
- [ ] Managed Redis deployed and tested
- [ ] Spaces created and configured
- [ ] All environment variables prepared
- [ ] Database migrations completed successfully
- [ ] GitHub repository ready
- [ ] .do/app.yaml configured correctly

### Deployment
- [ ] App Platform app created
- [ ] API service deployed and healthy
- [ ] Web service deployed and healthy
- [ ] Environment variables set correctly
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] DNS propagated and working

### Post-Launch
- [ ] Health checks passing
- [ ] User registration tested
- [ ] User login tested
- [ ] Jobs loading correctly
- [ ] Swipe functionality working
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Backups enabled and tested
- [ ] Error tracking setup (Sentry)
- [ ] Uptime monitoring setup

### Security
- [ ] HTTPS enforced everywhere
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Firewall rules configured
- [ ] Secrets rotated from defaults
- [ ] VPC configured (optional)
- [ ] Backup encryption enabled

---

## 🎉 Success Metrics

### Week 1 Goals
```
✅ 99.9% uptime
✅ < 1% error rate
✅ < 500ms API response time (p95)
✅ < 50 database connections (peak)
✅ > 80% cache hit rate
✅ 0 security incidents
```

### Month 1 Goals
```
✅ 99.95% uptime
✅ < 0.5% error rate
✅ < 400ms API response time (p95)
✅ 1000+ active users
✅ 10,000+ job applications
✅ $100-150/month infrastructure costs
```

---

## 🚀 You're Ready to Deploy!

This guide covers everything you need to deploy JobSwipe on DigitalOcean using your credits. The platform is production-ready, and DigitalOcean provides a great balance of simplicity and control.

### Key Advantages of This Setup

✅ **Cost-Effective**: ~$112/month (FREE with your credits for 2 months)
✅ **Simple**: App Platform handles deployments automatically
✅ **Scalable**: Easy to upgrade resources as you grow
✅ **Reliable**: Managed services with built-in backups
✅ **Secure**: VPC, SSL, and firewalls included

### Next Steps

1. **Start with Phase 1**: Set up infrastructure (60 min)
2. **Follow each phase**: Don't skip steps
3. **Test thoroughly**: Use provided test commands
4. **Monitor closely**: First 24 hours are critical
5. **Optimize**: Week 2+ based on real usage

**Good luck with your DigitalOcean deployment! 🌊**

---

*Last Updated: 2025-11-10*
*Version: 1.0*
*Platform: DigitalOcean*
*Prepared by: DevOps CTO*
