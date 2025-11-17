# 🚀 JobSwipe Deployment Script - Usage Guide

**One script to deploy everything!**

This automated deployment script handles your entire monorepo deployment including:
- ✅ Database migrations (packages/database)
- ✅ API backend → DigitalOcean (apps/api)
- ✅ Web frontend → Vercel (apps/web)

---

## ⚡ Quick Start

### **Full Deployment (Everything)**

```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Run full deployment
./deploy.sh
```

**That's it!** The script will guide you through the entire process interactively.

---

## 📝 Usage Options

### **1. Full Deployment (Recommended)**

Deploys everything in one go:

```bash
./deploy.sh
```

**What it does:**
1. ✅ Checks prerequisites (Node, pnpm, git)
2. ✅ Validates environment variables
3. ✅ Installs dependencies
4. ✅ Runs database migrations (from packages/database)
5. ✅ Builds API (apps/api)
6. ✅ Builds frontend (apps/web)
7. ✅ Deploys API to DigitalOcean
8. ✅ Deploys frontend to Vercel
9. ✅ Verifies deployment

**Time:** ~15-20 minutes (first time), ~5-10 minutes (subsequent)

---

### **2. API Only**

Deploy just the backend:

```bash
./deploy.sh --api-only
```

**What it does:**
1. ✅ Checks prerequisites
2. ✅ Runs database migrations
3. ✅ Builds API
4. ✅ Deploys to DigitalOcean

**Use when:** You only changed backend code

---

### **3. Frontend Only**

Deploy just the web app:

```bash
./deploy.sh --web-only
```

**What it does:**
1. ✅ Checks prerequisites
2. ✅ Builds frontend
3. ✅ Deploys to Vercel

**Use when:** You only changed frontend code

---

### **4. Database Migrations Only**

Run only database migrations:

```bash
./deploy.sh --db-only
```

**What it does:**
1. ✅ Checks database connection
2. ✅ Generates Prisma Client
3. ✅ Runs migrations from packages/database
4. ✅ Verifies schema

**Use when:** You only changed database schema

---

### **5. Rollback Deployment**

Revert to previous version:

```bash
./deploy.sh --rollback
```

**What it does:**
- Shows rollback options for API, Frontend, or Database
- Guides you through rollback process

**Use when:** Something went wrong with deployment

---

### **6. Check Prerequisites**

Verify your setup without deploying:

```bash
./deploy.sh --check
```

**What it checks:**
- Node.js version (>= 20)
- pnpm installed
- Git repository
- Monorepo structure
- Environment variables

**Use when:** Setting up for first time

---

## 📋 Prerequisites

Before running the script, you need:

### **Required Software**

```bash
✅ Node.js >= 20.0.0
✅ pnpm (npm install -g pnpm)
✅ Git
✅ Vercel CLI (npm install -g vercel)
```

### **Optional Software**

```bash
⚪ doctl (DigitalOcean CLI) - for automated DO deployment
```

### **Required Files**

```bash
✅ .env.production (or env.production.example)
✅ pnpm-lock.yaml (should exist)
✅ packages/database/prisma/schema.prisma
```

### **Required Accounts**

```bash
✅ DigitalOcean account with credits
✅ Vercel account
✅ Neon/Supabase database (or DO Managed DB)
✅ Upstash Redis account
✅ Anthropic API key
```

---

## 🔧 Setup Instructions

### **Step 1: Install Required Tools**

```bash
# Install pnpm globally
npm install -g pnpm

# Install Vercel CLI
npm install -g vercel

# Optional: Install DigitalOcean CLI
# macOS:
brew install doctl

# Linux:
snap install doctl
```

### **Step 2: Create Environment File**

```bash
# Copy template
cp env.production.example .env.production

# Edit with your values
nano .env.production
# or
code .env.production
```

**Required environment variables:**

```bash
# Database (Neon)
DATABASE_URL="postgresql://..."

# Redis (Upstash)
REDIS_URL="redis://..."

# JWT Secrets
JWT_SECRET="your-generated-secret"
JWT_REFRESH_SECRET="your-generated-secret"
ENCRYPTION_KEY="your-32-char-key"

# DigitalOcean Spaces
AWS_ACCESS_KEY_ID="DO00..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="jobswipe-production-resumes"

# AI APIs
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..." (optional)

# CORS
API_CORS_ORIGIN="https://yourdomain.com,https://yourapp.vercel.app"
```

### **Step 3: Generate Secrets**

```bash
# Generate JWT secrets
openssl rand -base64 48  # JWT_SECRET
openssl rand -base64 48  # JWT_REFRESH_SECRET
openssl rand -base64 32  # ENCRYPTION_KEY
```

### **Step 4: Login to Services**

```bash
# Login to Vercel
vercel login

# Optional: Login to DigitalOcean
doctl auth init
```

### **Step 5: Run Deployment**

```bash
# Make script executable
chmod +x deploy.sh

# Deploy!
./deploy.sh
```

---

## 🎯 What The Script Does

### **Phase 1: Validation** (2 min)

```bash
✓ Checks Node.js version
✓ Checks pnpm installed
✓ Checks git repository
✓ Checks monorepo structure
✓ Validates environment variables
✓ Tests database connection
```

### **Phase 2: Dependencies** (2-5 min)

```bash
✓ Runs pnpm install --frozen-lockfile
✓ Installs all workspace dependencies
✓ Uses existing pnpm-lock.yaml
```

### **Phase 3: Database** (2-3 min)

```bash
✓ Generates Prisma Client (packages/database)
✓ Runs migrations: pnpm run db:migrate:deploy
✓ Verifies schema
✓ Optional: Seeds database
```

### **Phase 4: Build** (3-5 min)

```bash
# API Build:
✓ cd apps/api
✓ pnpm run build:production
✓ Creates dist/ folder

# Frontend Build:
✓ cd apps/web
✓ pnpm run build
✓ Creates .next/ folder
```

### **Phase 5: Deploy** (5-10 min)

```bash
# API Deployment (DigitalOcean):
✓ Commits and pushes code
✓ Triggers DO App Platform build
✓ Waits for deployment

# Frontend Deployment (Vercel):
✓ Runs vercel --prod
✓ Uploads build to Vercel
✓ Deploys to production
```

### **Phase 6: Verify** (1 min)

```bash
✓ Tests API health endpoint
✓ Shows deployment summary
✓ Displays URLs
```

---

## 🎨 Interactive Mode

The script runs in **interactive mode** by default, asking for confirmation at each step:

```bash
? Continue with full deployment? [y/n]: y
? Install/update dependencies? [y/n]: y
? Run database migrations? [y/n]: y
? Build applications? [y/n]: y
? Deploy to cloud platforms? [y/n]: y
? Would you like to seed the database? [y/n]: n
```

**You have control at every step!**

---

## 🔍 Example Run

```bash
$ ./deploy.sh

╔════════════════════════════════════════════════════════════════╗
║  🚀 JobSwipe Full Deployment
╚════════════════════════════════════════════════════════════════╝

This script will deploy:
  1. Database migrations (packages/database)
  2. API backend → DigitalOcean (apps/api)
  3. Web frontend → Vercel (apps/web)

? Continue with full deployment? [y/n]: y

╔════════════════════════════════════════════════════════════════╗
║  Checking Prerequisites
╚════════════════════════════════════════════════════════════════╝

▶ Checking required commands...
✔ node is installed
✔ pnpm is installed
✔ git is installed

▶ Checking Node.js version...
✔ Node.js version: v20.11.0 (>= 20 required)

▶ Checking repository...
✔ Git repository found

▶ Checking monorepo structure...
✔ pnpm workspace configured

▶ Checking critical directories...
✔ apps/api exists
✔ apps/web exists
✔ packages/database exists

✔ All prerequisites met!

╔════════════════════════════════════════════════════════════════╗
║  Checking Environment Variables
╚════════════════════════════════════════════════════════════════╝

▶ Loading environment variables...
▶ Validating critical environment variables...
✔ All critical environment variables are set

? Install/update dependencies? [y/n]: y

╔════════════════════════════════════════════════════════════════╗
║  Installing Dependencies
╚════════════════════════════════════════════════════════════════╝

▶ Installing root dependencies...
Scope: all 10 workspace projects
✔ Dependencies installed successfully

? Run database migrations? [y/n]: y

╔════════════════════════════════════════════════════════════════╗
║  Running Database Migrations
╚════════════════════════════════════════════════════════════════╝

▶ Testing database connection...
✔ Database connection successful

▶ Generating Prisma Client...
✔ Generated Prisma Client

▶ Running migrations...
✔ Database migrations completed

? Would you like to seed the database? [y/n]: n

? Build applications? [y/n]: y

╔════════════════════════════════════════════════════════════════╗
║  Building API
╚════════════════════════════════════════════════════════════════╝

▶ Building API application...
✔ API built successfully

╔════════════════════════════════════════════════════════════════╗
║  Building Web Frontend
╚════════════════════════════════════════════════════════════════╝

▶ Building Next.js application...
✔ Web frontend built successfully

? Deploy to cloud platforms? [y/n]: y

╔════════════════════════════════════════════════════════════════╗
║  Deploying API to DigitalOcean
╚════════════════════════════════════════════════════════════════╝

▶ Checking git status...
✔ Changes pushed to main

ℹ DigitalOcean deployment options:
  1. Deploy via Dashboard (recommended)
  2. Deploy via CLI (requires doctl)
  3. Skip

Choose option [1-3]: 1

╔════════════════════════════════════════════════════════════════╗
║  Deploying Web Frontend to Vercel
╚════════════════════════════════════════════════════════════════╝

✔ Logged in to Vercel as: your-email@example.com

ℹ Deployment options:
  1. Deploy to production
  2. Deploy to preview
  3. Skip

Choose option [1-3]: 1

▶ Deploying to production...
✔ Deployed to production!

╔════════════════════════════════════════════════════════════════╗
║  Verifying Deployment
╚════════════════════════════════════════════════════════════════╝

▶ Testing API health endpoint...
✔ API is responding

▶ Deployment summary:

  📦 Database:  Migrated ✔
  🚀 API:       Deployed to DigitalOcean
  🌐 Frontend:  Deployed to Vercel

✔ Deployment verification completed

╔════════════════════════════════════════════════════════════════╗
║  🎉 Deployment Complete!
╚════════════════════════════════════════════════════════════════╝

Next steps:
  1. Test your application thoroughly
  2. Monitor logs for errors
  3. Set up monitoring alerts
  4. Update documentation

ℹ Useful commands:
  ./deploy.sh --api-only    # Deploy only API
  ./deploy.sh --web-only    # Deploy only frontend
  ./deploy.sh --db-only     # Run only migrations
  ./deploy.sh --rollback    # Rollback deployment
```

---

## 🐛 Troubleshooting

### **Issue: Script not executable**

```bash
Error: bash: ./deploy.sh: Permission denied

Solution:
chmod +x deploy.sh
./deploy.sh
```

### **Issue: pnpm not found**

```bash
Error: pnpm is not installed

Solution:
npm install -g pnpm
```

### **Issue: Environment variables missing**

```bash
Error: Missing required environment variables

Solution:
1. cp env.production.example .env.production
2. Edit .env.production with your values
3. Run ./deploy.sh again
```

### **Issue: Database connection failed**

```bash
Error: Cannot connect to database

Solution:
1. Check DATABASE_URL in .env.production
2. Ensure database is not paused (Neon free tier)
3. Verify network connectivity
4. Check if DATABASE_URL has ?sslmode=require
```

### **Issue: Build fails**

```bash
Error: Build failed

Solution:
1. Check build logs for errors
2. Test locally: cd apps/api && pnpm run build
3. Ensure all dependencies installed: pnpm install
4. Check for TypeScript errors
```

### **Issue: Vercel login fails**

```bash
Error: Not logged in to Vercel

Solution:
vercel login
# Follow browser authentication
```

---

## 💡 Pro Tips

### **1. Test Locally First**

```bash
# Test database migrations
cd packages/database
pnpm run db:migrate

# Test API build
cd apps/api
pnpm run build:production

# Test frontend build
cd apps/web
pnpm run build
```

### **2. Use Partial Deployments**

During development, deploy only what changed:

```bash
# Changed backend only:
./deploy.sh --api-only

# Changed frontend only:
./deploy.sh --web-only

# Changed database schema only:
./deploy.sh --db-only
```

### **3. Monitor Deployments**

```bash
# Watch DigitalOcean logs:
# https://cloud.digitalocean.com/apps → Your App → Logs

# Watch Vercel logs:
vercel logs
```

### **4. Quick Rollback**

If something goes wrong:

```bash
# Rollback immediately
./deploy.sh --rollback

# Or manually:
# Vercel: Dashboard → Deployments → Previous → Promote
# DO: Dashboard → Activity → Previous → Rollback
```

### **5. Automate with CI/CD**

Add to `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: ./deploy.sh --api-only
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          # ... other secrets
```

---

## 🔐 Security Notes

**⚠️ NEVER commit `.env.production` to git!**

It contains secrets and is already in `.gitignore`.

**✅ Safe to commit:**
- `deploy.sh`
- `env.production.example`
- `pnpm-lock.yaml`

**❌ NEVER commit:**
- `.env.production`
- `.env.local`
- Any file with real secrets

---

## 📚 Related Documentation

- **Full Deployment Guide**: `HYBRID_DEPLOYMENT_GUIDE.md`
- **Production Setup**: `PRODUCTION_SETUP_GUIDE.md`
- **Vercel Guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **DigitalOcean Guide**: `DIGITALOCEAN_DEPLOYMENT_GUIDE.md`

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** - Script shows detailed error messages
2. **Run with --check** - Verify your setup
3. **Read the error** - Most errors are self-explanatory
4. **Check related docs** - See links above
5. **Test locally** - Try building locally first

---

## ✅ Success Criteria

Your deployment succeeded when:

```bash
✔ Script completes without errors
✔ API health check passes
✔ Frontend loads at Vercel URL
✔ Database migrations applied
✔ All environment variables set
✔ No errors in deployment logs
```

---

**🎉 Happy Deploying!**

This script is designed to make your life easier. Use it every time you deploy!
