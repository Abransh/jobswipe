# 🚀 Production Deployment - Quick Setup Guide

## ✅ What I've Done For You

1. ✅ Created `.env.production` with proper production settings
2. ✅ Created `.do/app.yaml` for DigitalOcean App Platform
3. ✅ Fixed `package.json` to use pnpm
4. ✅ Added buildpack configuration

## 🔥 Critical: Update These Values BEFORE Deploying

### 1. Generate New Secrets

Run these commands and **SAVE THE OUTPUT**:

```bash
# JWT Secret
echo "JWT_SECRET=$(openssl rand -base64 48)"

# JWT Refresh Secret
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)"

# Encryption Key (must be exactly 32 characters)
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"

# Session Secret (optional, for cookies)
echo "SESSION_SECRET=$(openssl rand -base64 32)"
```

### 2. Set Up Upstash Redis

**Your existing Neon database is already configured! ✅**

But you need Redis for caching and queues:

```bash
1. Go to: https://upstash.com
2. Sign up with GitHub
3. Create new database:
   - Name: jobswipe-production
   - Region: US East (same as your Neon DB in eu-central-1, choose closest)
   - Type: Regional (cheaper) or Global (faster)
4. Copy the connection string:
   - Format: redis://default:PASSWORD@us1-xxx.upstash.io:6379
```

### 3. Set Up DigitalOcean Spaces (S3 Storage)

```bash
1. Go to: https://cloud.digitalocean.com/spaces
2. Create Space:
   - Name: jobswipe-production-resumes
   - Region: NYC3 (or closest to you)
   - Enable CDN: YES
   - File Listing: Private
3. Generate API keys:
   - Settings → API → Spaces Keys
   - Generate New Key
   - Save BOTH keys immediately!
```

### 4. Get AI API Keys

```bash
Anthropic (Required for automation):
1. Go to: https://console.anthropic.com
2. Create API key
3. Add $50 credit minimum
4. Save key (starts with: sk-ant-)

OpenAI (Optional backup):
1. Go to: https://platform.openai.com
2. Create API key
3. Set usage limit: $50/month
4. Save key (starts with: sk-)
```

## 📝 Update .env.production File

Open `.env.production` and replace these values:

```bash
# Line 16: Redis URL (from Upstash)
REDIS_URL="redis://default:YOUR_PASSWORD@us1-xxx.upstash.io:6379"

# Lines 27-28: JWT Secrets (from step 1)
JWT_SECRET="YOUR_GENERATED_SECRET_HERE"
JWT_REFRESH_SECRET="YOUR_GENERATED_REFRESH_SECRET_HERE"

# Line 36: Encryption Key (from step 1)
ENCRYPTION_KEY="YOUR_GENERATED_32_CHAR_KEY_HERE"

# Line 53: CORS (update with your actual domains)
API_CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com,https://yourapp.vercel.app"

# Lines 62-65: Spaces credentials (from step 3)
AWS_ACCESS_KEY_ID="DO00XXXXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY_HERE"
AWS_S3_BUCKET="jobswipe-production-resumes"

# Line 92: Anthropic API key (from step 4)
ANTHROPIC_API_KEY="sk-ant-XXXXXXXXXX"

# Line 93: OpenAI API key (optional, from step 4)
OPENAI_API_KEY="sk-XXXXXXXXXX"
```

## 🌊 Deploy to DigitalOcean

### Option 1: Via Dashboard (Recommended)

```bash
1. Go to: https://cloud.digitalocean.com/apps

2. Click "Create App"

3. Connect GitHub:
   - Select your repository: jobswipe
   - Branch: main
   - Autodeploy: ✅ Enable

4. Configure Resources:
   - App Platform will auto-detect your app
   - OR click "Edit" and manually configure:

     Source Directory: /
     Build Command: (leave as detected)
     Run Command: cd apps/api && node dist/index.js
     HTTP Port: 8080

5. Add Environment Variables:
   - Click "Environment Variables"
   - Copy ALL variables from .env.production
   - Add them one by one (or bulk import)

   CRITICAL VARIABLES:
   ✅ DATABASE_URL (your Neon DB - already have it!)
   ✅ REDIS_URL (from Upstash)
   ✅ JWT_SECRET (generated)
   ✅ JWT_REFRESH_SECRET (generated)
   ✅ ENCRYPTION_KEY (generated)
   ✅ AWS_ACCESS_KEY_ID (Spaces)
   ✅ AWS_SECRET_ACCESS_KEY (Spaces)
   ✅ ANTHROPIC_API_KEY
   ✅ API_CORS_ORIGIN (your domains)

6. Set App Name:
   - Name: jobswipe-api
   - Region: NYC (or closest to your DB)

7. Review & Create:
   - Instance: Basic ($12/month)
   - Click "Create Resources"

8. Wait for deployment (10-15 minutes)
   - Watch build logs
   - First build takes longer
```

### Option 2: Via CLI

```bash
# Install doctl
brew install doctl  # macOS
# OR
snap install doctl  # Linux

# Login
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml

# Wait for build
doctl apps list
doctl apps logs <APP_ID> --follow
```

## 🧪 Test Your Deployment

```bash
# Get your app URL from DO dashboard
# Example: https://api-jobswipe-abc123.ondigitalocean.app

# Test health endpoint
curl https://your-api-url.ondigitalocean.app/health

# Should return:
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}

# Test detailed health
curl https://your-api-url.ondigitalocean.app/health/detailed

# Should show:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}

# Test user registration
curl -X POST https://your-api-url.ondigitalocean.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "name": "Test User"
  }'

# Should return user object with JWT token
```

## 🔧 If Build Fails

### Error: "package-lock.json does not exist"

**FIXED!** I added `"packageManager": "pnpm@9.0.0"` to package.json

If still failing:
```bash
# Commit the changes
git add package.json .do/app.yaml .env.production project.toml
git commit -m "fix: Configure DO App Platform for pnpm monorepo"
git push origin main

# Trigger new deployment in DO dashboard
```

### Error: "Build timeout" or "Out of memory"

```bash
# In DO dashboard:
1. Settings → Resources
2. Increase instance size: Basic-S or Basic-M
3. Retry deployment
```

### Error: "Cannot find module"

```bash
# Check build command in .do/app.yaml
# Should be:
build_command: |
  npm install -g pnpm@latest
  pnpm install --frozen-lockfile
  cd apps/api
  pnpm run build:production
```

## 🎯 Next Steps After Successful Deploy

### 1. Add Custom Domain

```bash
1. DO Dashboard → Your App → Settings → Domains
2. Add domain: api.yourdomain.com
3. Configure DNS (DO provides instructions)
4. SSL certificate: Automatic
```

### 2. Deploy Frontend to Vercel

```bash
# See HYBRID_DEPLOYMENT_GUIDE.md Phase 3
cd apps/web
vercel --prod
```

### 3. Enable Monitoring

```bash
1. Set up UptimeRobot:
   - Monitor: https://api.yourdomain.com/health
   - Interval: 5 minutes

2. Add Sentry (optional):
   - Create account
   - Add SENTRY_DSN to environment variables
```

### 4. Configure Backups

```bash
# Your Neon DB already has automatic backups!
# Verify in Neon dashboard:
1. Go to: https://console.neon.tech
2. Your project → Settings → Backups
3. Should show: Point-in-time restore enabled
```

## 📊 Environment Variables Reference

### Must Have (Critical):
```bash
DATABASE_URL            ✅ You have this (Neon)
REDIS_URL              ⚠️ Need Upstash
JWT_SECRET             ⚠️ Must generate
JWT_REFRESH_SECRET     ⚠️ Must generate
ENCRYPTION_KEY         ⚠️ Must generate
AWS_ACCESS_KEY_ID      ⚠️ Need Spaces
AWS_SECRET_ACCESS_KEY  ⚠️ Need Spaces
ANTHROPIC_API_KEY      ⚠️ Need API key
```

### Should Have (Important):
```bash
API_CORS_ORIGIN        → Your frontend domains
RATE_LIMIT_MAX_REQUESTS → 500 (set in .env.production)
CSRF_ENABLED           → true (set in .env.production)
```

### Nice to Have (Optional):
```bash
OPENAI_API_KEY         → Backup AI service
SENTRY_DSN             → Error tracking
SMTP_HOST/PORT/USER    → Email notifications
```

## 💰 Cost Estimate

```bash
DigitalOcean App Platform: $12/month (Basic)
Your Neon DB:              Already have it! ✅
Upstash Redis (free tier): $0-10/month
DO Spaces:                 $5/month
Anthropic API:             ~$50/month (usage-based)
───────────────────────────────────────
TOTAL:                     ~$67-77/month

With your $200 DO credits: First 2-3 months FREE!
```

## 🆘 Getting Help

### Check Logs

```bash
# DigitalOcean Dashboard:
Your App → Logs → View all logs

# Or via CLI:
doctl apps logs <APP_ID> --follow
```

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL has `?sslmode=require`
   - Verify Neon DB is not paused (happens on free tier after inactivity)

2. **Redis connection timeout**
   - Check REDIS_URL format: `redis://default:pass@host:6379`
   - Test connection from local machine

3. **Build fails**
   - Check build logs in DO dashboard
   - Verify all dependencies in package.json
   - Try increasing instance size

### Support Resources

```bash
DigitalOcean Community: https://www.digitalocean.com/community
DO Support Tickets:     https://cloud.digitalocean.com/support
Upstash Discord:        https://discord.gg/upstash
Neon Discord:           https://discord.gg/neon
```

## ✅ Deployment Checklist

### Before Deploying:
- [ ] Generated new JWT secrets
- [ ] Created Upstash Redis database
- [ ] Created DO Spaces bucket
- [ ] Got Anthropic API key
- [ ] Updated .env.production with all values
- [ ] Committed changes to git

### During Deployment:
- [ ] App created in DO
- [ ] All environment variables added
- [ ] Build completed successfully
- [ ] Health checks passing

### After Deployment:
- [ ] Tested /health endpoint
- [ ] Tested /health/detailed endpoint
- [ ] Tested user registration
- [ ] Set up monitoring (UptimeRobot)
- [ ] Added custom domain
- [ ] Configured CORS with frontend domain

---

**🎉 You're Ready to Deploy!**

Your `.env.production` is configured, your build is fixed, and you have step-by-step instructions.

**Start with Step 1: Generate secrets, then follow the guide!**
