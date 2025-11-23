# 🚀 Vercel Frontend Deployment Guide - JobSwipe Monorepo

Complete guide for deploying the Next.js 15 frontend to Vercel with proper monorepo configuration.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Deployment (5 minutes)](#quick-deployment)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Monorepo Configuration](#monorepo-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Post-Deployment](#post-deployment)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [x] DigitalOcean API deployed and running (from previous steps)
- [x] Vercel account (free tier works fine)
- [x] GitHub repository with latest code pushed
- [x] API URL from DigitalOcean deployment
- [x] JWT_SECRET from your .env.production

---

## 🚀 Quick Deployment (5 Minutes)

### **Option 1: Using Vercel CLI (Recommended)**

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to repository root
cd /path/to/jobswipe

# 3. Login to Vercel
vercel login

# 4. Deploy (first time will ask configuration questions)
vercel --cwd apps/web

# 5. Follow prompts:
# - Set up and deploy? → Yes
# - Which scope? → Your username/team
# - Link to existing project? → No
# - What's your project's name? → jobswipe-web
# - In which directory is your code located? → ./
# - Want to override settings? → Yes
# - Build Command? → Use default (already in vercel.json)
# - Output Directory? → Use default (.next)
# - Development Command? → Use default

# 6. Set environment variables (see below)

# 7. Deploy to production
vercel --prod --cwd apps/web
```

### **Option 2: Using Vercel Dashboard (Easier for First Time)**

1. **Go to**: https://vercel.com/new
2. **Import Git Repository**: Connect your GitHub account and select `jobswipe`
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: (leave empty - uses vercel.json)
   - **Output Directory**: `.next`
   - **Install Command**: (leave empty - uses vercel.json)
4. **Add Environment Variables** (see below)
5. **Click Deploy**

---

## 🔐 Environment Variables Setup

### **Required Environment Variables**

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# === CRITICAL: API Connection ===
NEXT_PUBLIC_API_URL=https://your-do-api-url.ondigitalocean.app
# Replace with your DigitalOcean API URL

# === CRITICAL: JWT Secret (MUST match API server) ===
JWT_SECRET=<YOUR_JWT_SECRET_FROM_API>
# Copy from your API .env.production - MUST BE IDENTICAL

# === Public App URL ===
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
# Will be auto-set after first deployment, then update this

# === Database (Optional - for web API routes) ===
DATABASE_URL=<YOUR_NEON_DATABASE_URL>
# If web app needs direct database access

# === Node Environment ===
NODE_ENV=production

# === Optional: OAuth Providers ===
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# === Optional: Feature Flags ===
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_SENTRY=false
```

### **How to Add Environment Variables**

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value**: Variable value
   - **Environments**: Select `Production`, `Preview`, and `Development`
4. Click **Save**

**Via Vercel CLI:**
```bash
# Add environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Paste value when prompted

# Add secret (JWT_SECRET)
vercel env add JWT_SECRET production
# Paste value when prompted

# List all environment variables
vercel env ls
```

---

## 📝 Step-by-Step Deployment

### **Step 1: Verify Repository**

```bash
# Ensure all changes are committed and pushed
git status
git add -A
git commit -m "feat: Configure Vercel deployment for monorepo"
git push origin main
```

### **Step 2: Deploy via Vercel Dashboard**

1. **Login to Vercel**: https://vercel.com
2. **Click "Add New..."** → "Project"
3. **Import Git Repository**:
   - Click "Import" next to your `jobswipe` repository
   - If not listed, click "Adjust GitHub App Permissions"
4. **Configure Project**:
   ```
   Project Name: jobswipe-web
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: (leave blank - uses vercel.json)
   Output Directory: .next
   Install Command: (leave blank - uses vercel.json)
   ```
5. **Add Environment Variables** (from section above)
6. **Click "Deploy"**

### **Step 3: Monitor Build**

Watch the build logs in real-time:
- Vercel will show the build progress
- **Build Steps**:
  ```
  ✓ Installing pnpm
  ✓ Installing dependencies (entire monorepo)
  ✓ Generating Prisma Client
  ✓ Building @jobswipe/shared
  ✓ Building @jobswipe/database
  ✓ Building @jobswipe/web (Next.js)
  ✓ Optimizing production build
  ```

### **Step 4: Verify Deployment**

Once deployed:
1. **Get Deployment URL**: `https://jobswipe-web-abc123.vercel.app`
2. **Test the site**:
   - Visit the URL
   - Check if pages load correctly
   - Test authentication flow
   - Verify API connectivity

### **Step 5: Configure Custom Domain (Optional)**

1. **Go to**: Project Settings → Domains
2. **Add Domain**: Enter your custom domain
3. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or follow Vercel's specific instructions
4. **Wait for DNS propagation** (5-60 minutes)

---

## ⚙️ Monorepo Configuration

### **How the Build Works**

The `vercel.json` configuration handles the monorepo setup:

```json
{
  "buildCommand": "cd ../.. && pnpm install --frozen-lockfile --ignore-scripts && cd packages/database && pnpm run db:generate && cd ../.. && pnpm --filter @jobswipe/shared build && pnpm --filter @jobswipe/database build && pnpm --filter @jobswipe/web build",
  "installCommand": "npm install -g pnpm@latest && echo 'pnpm installed globally'"
}
```

**Build Order:**
1. **Install pnpm** globally
2. **Install all dependencies** from monorepo root (with frozen lockfile)
3. **Generate Prisma Client** (database package needs this)
4. **Build @jobswipe/shared** (no dependencies)
5. **Build @jobswipe/database** (depends on shared)
6. **Build @jobswipe/web** (depends on both)

### **Why This Works**

- ✅ Vercel builds from repository root
- ✅ All workspace packages are available
- ✅ Dependencies are built in correct order
- ✅ TypeScript can find all workspace packages
- ✅ No "module not found" errors

---

## 🔧 Troubleshooting

### **Issue 1: "Cannot find module '@jobswipe/shared'"**

**Solution**: Ensure workspace packages are built first
```bash
# The buildCommand in vercel.json handles this automatically
# If still failing, check build logs for errors in @jobswipe/shared build
```

### **Issue 2: "pnpm: command not found"**

**Solution**: Verify installCommand in vercel.json
```json
{
  "installCommand": "npm install -g pnpm@latest && echo 'pnpm installed globally'"
}
```

### **Issue 3: Build Timeout**

**Solution**: Vercel free tier has 45-second build limit
- Check if build is too large
- Consider upgrading to Pro plan ($20/month) for 15-minute builds
- Or optimize build by removing unused dependencies

### **Issue 4: Environment Variables Not Working**

**Solution**:
1. Check variable names (case-sensitive)
2. Ensure `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding variables
4. Clear cache: `vercel --prod --force`

### **Issue 5: API Connection Failed**

**Checklist**:
- [ ] `NEXT_PUBLIC_API_URL` is set correctly
- [ ] API URL is accessible (test with curl)
- [ ] CORS is configured on API server
- [ ] JWT_SECRET matches between frontend and API

**Test API connectivity**:
```bash
# From your local machine
curl https://your-api-url.ondigitalocean.app/health

# Should return: { "status": "ok", ... }
```

### **Issue 6: Prisma Client Generation Failed**

**Solution**:
```bash
# Ensure DATABASE_URL is set (if needed for generation)
# Check packages/database/prisma/schema.prisma exists
# Verify build command includes: cd packages/database && pnpm run db:generate
```

---

## 🎯 Post-Deployment

### **Update CORS Settings on API**

Update your DigitalOcean API environment variables:

```bash
# In DigitalOcean App Platform → Environment Variables
API_CORS_ORIGIN=https://your-app.vercel.app,https://your-custom-domain.com
```

### **Update Frontend Environment Variable**

Update `NEXT_PUBLIC_APP_URL` in Vercel:
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Then redeploy:
```bash
vercel --prod --cwd apps/web
```

### **Test Complete Flow**

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test Registration**:
   - Create new account
   - Verify email/password works
   - Check JWT token is set
3. **Test Authentication**:
   - Login with credentials
   - Check protected routes work
   - Verify session persistence
4. **Test API Connectivity**:
   - Make API calls
   - Check network tab for API requests
   - Verify responses are correct
5. **Test OAuth** (if configured):
   - Google OAuth login
   - GitHub OAuth login
   - LinkedIn OAuth login

### **Set Up Automatic Deployments**

Vercel automatically deploys when you push to GitHub:

**Production Deployments**:
- Push to `main` branch → Deploys to production

**Preview Deployments**:
- Push to any other branch → Creates preview deployment
- Open PR → Creates preview deployment with unique URL

**Configure Branch Protection**:
```bash
# In Vercel Dashboard → Git → Production Branch
Production Branch: main

# In GitHub → Repository Settings → Branches
Require pull request reviews: Yes
Require status checks: Yes (Vercel checks)
```

---

## 📊 Cost Breakdown

### **Vercel Pricing**

**Free Tier** (Hobby):
- 100 GB bandwidth/month
- Unlimited deployments
- HTTPS + CDN included
- **Cost**: $0/month ✅

**Pro Tier**:
- 1 TB bandwidth/month
- Faster builds (15 min vs 45 sec)
- Team collaboration
- **Cost**: $20/month

**Recommendation**: Start with Free tier, upgrade if needed

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables are set in Vercel
- [ ] JWT_SECRET matches API server
- [ ] API CORS includes Vercel URL
- [ ] Database connection works (if applicable)
- [ ] OAuth providers configured (if using)
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test API connectivity
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Build succeeds without errors
- [ ] All pages load correctly
- [ ] Mobile responsive design works

---

## 🚀 Quick Reference Commands

```bash
# Deploy to preview
vercel --cwd apps/web

# Deploy to production
vercel --prod --cwd apps/web

# Check deployment status
vercel ls

# View build logs
vercel logs <deployment-url>

# Add environment variable
vercel env add VARIABLE_NAME production

# List environment variables
vercel env ls

# Remove deployment
vercel rm <deployment-url>

# Link local project to Vercel
vercel link
```

---

## 📚 Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Monorepo Support**: https://vercel.com/docs/concepts/monorepos
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Custom Domains**: https://vercel.com/docs/concepts/projects/domains

---

## 🎉 Success!

Your JobSwipe frontend is now deployed on Vercel with:
- ✅ Global CDN for fast worldwide access
- ✅ Automatic HTTPS/SSL
- ✅ Automatic deployments from Git
- ✅ Preview deployments for PRs
- ✅ Monorepo workspace packages working
- ✅ Connected to DigitalOcean API backend

**Your Stack**:
- 🎨 Frontend: Vercel (Next.js 15)
- 🔧 Backend: DigitalOcean App Platform (Fastify)
- 🗄️ Database: Neon PostgreSQL
- 💾 Cache: Upstash Redis
- 📦 Storage: DigitalOcean Spaces

---

**Questions or Issues?**
- Check the Troubleshooting section above
- Review Vercel build logs
- Test API connectivity separately
- Verify environment variables are set correctly
