# 🔧 DigitalOcean Environment Variables Setup

## Critical Issue: Missing Production Environment Variables

Your build succeeded, but deployment is failing because environment variables are not set in DigitalOcean App Platform.

---

## 🚨 Current Errors

1. **Redis Connection Failed**: App is trying `localhost:6379` instead of Upstash Redis
2. **Missing OAUTH_TOKEN_ENCRYPTION_KEY**: Required for OAuth token encryption
3. **NODE_ENV is development**: Should be production
4. **Missing API keys**: ANTHROPIC_API_KEY, OPENAI_API_KEY

---

## ✅ Fix: Add Environment Variables in DigitalOcean

### **Step 1: Go to App Platform Settings**

1. Log in to DigitalOcean: https://cloud.digitalocean.com/apps
2. Select your **jobswipe-api** app
3. Click **Settings** (top navigation)
4. Scroll to **App-Level Environment Variables**
5. Click **Edit**

### **Step 2: Add Required Environment Variables**

Click **+ Add Variable** for each:

#### **🔴 CRITICAL - Required for Deployment**

```bash
# Redis (BullMQ Queue)
REDIS_URL=<YOUR_UPSTASH_REDIS_URL>
# Example: redis://:password@hostname.upstash.io:port

# Database
DATABASE_URL=<YOUR_NEON_DATABASE_URL>
# Already configured - verify it's correct

# JWT Secrets (MUST match frontend)
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_REFRESH_SECRET=<YOUR_JWT_REFRESH_SECRET>

# Encryption Key (for OAuth tokens)
ENCRYPTION_KEY=<GENERATE_32_CHAR_KEY>
OAUTH_TOKEN_ENCRYPTION_KEY=<GENERATE_32_CHAR_KEY>

# Node Environment
NODE_ENV=production

# CORS (Add your Vercel URL)
API_CORS_ORIGIN=https://your-app.vercel.app,https://your-domain.com
```

#### **🟡 OPTIONAL - For Full Features**

```bash
# AI Services (for automation features)
ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_KEY>
OPENAI_API_KEY=<YOUR_OPENAI_KEY>

# OAuth Providers (if using social login)
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
GITHUB_CLIENT_ID=<YOUR_GITHUB_CLIENT_ID>
GITHUB_CLIENT_SECRET=<YOUR_GITHUB_CLIENT_SECRET>
LINKEDIN_CLIENT_ID=<YOUR_LINKEDIN_CLIENT_ID>
LINKEDIN_CLIENT_SECRET=<YOUR_LINKEDIN_CLIENT_SECRET>

# DigitalOcean Spaces (for file uploads)
AWS_ACCESS_KEY_ID=<YOUR_DO_SPACES_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_DO_SPACES_SECRET>
AWS_REGION=nyc3
AWS_S3_BUCKET=<YOUR_BUCKET_NAME>
AWS_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

### **Step 3: Generate Secrets**

Use these commands to generate secure secrets:

```bash
# JWT_SECRET (if you don't have one)
openssl rand -base64 48

# JWT_REFRESH_SECRET
openssl rand -base64 48

# ENCRYPTION_KEY (32 characters minimum)
openssl rand -base64 32

# OAUTH_TOKEN_ENCRYPTION_KEY (32 characters minimum)
openssl rand -base64 32
```

### **Step 4: Get Upstash Redis URL**

If you don't have Upstash Redis set up yet:

1. Go to: https://console.upstash.com/
2. Create account (free tier available)
3. Click **Create Database**
4. Name: `jobswipe-redis`
5. Region: Choose closest to your DigitalOcean region
6. Click **Create**
7. Copy the **REDIS_URL** (looks like: `redis://:password@hostname.upstash.io:port`)
8. Add to DigitalOcean environment variables

---

## 📋 Checklist: Required Variables

Before redeploying, ensure these are set:

### **Must Have (App Won't Start Without These):**
- [ ] `REDIS_URL` - Upstash Redis connection string
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `JWT_REFRESH_SECRET` - Refresh token secret
- [ ] `ENCRYPTION_KEY` - General encryption key
- [ ] `OAUTH_TOKEN_ENCRYPTION_KEY` - OAuth token encryption
- [ ] `NODE_ENV` - Set to `production`

### **Should Have (For Full Functionality):**
- [ ] `API_CORS_ORIGIN` - Your Vercel frontend URL
- [ ] `ANTHROPIC_API_KEY` - For AI automation features
- [ ] `OPENAI_API_KEY` - For AI automation features

### **Optional (For OAuth Social Login):**
- [ ] Google OAuth credentials
- [ ] GitHub OAuth credentials
- [ ] LinkedIn OAuth credentials

---

## 🚀 After Adding Variables

### **Redeploy the App**

1. Go to **Deployments** tab
2. Click **Actions** → **Force Rebuild and Deploy**
3. Or wait for automatic deployment

### **Expected Output**

After adding the environment variables, the deployment should succeed:

```bash
✓ Build completed successfully
✓ Starting application...
✓ Connecting to Redis (Upstash)
✓ Redis connection established
✓ Connecting to PostgreSQL (Neon)
✓ Database connection established
✓ All plugins loaded successfully
✓ Server started on port 8080
✓ Health check passed
✓ Deployment successful
```

---

## 🔍 Verify Deployment

Once deployed, test the health endpoint:

```bash
curl https://your-api-url.ondigitalocean.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T00:00:00.000Z",
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## ⚠️ Important Notes

1. **JWT_SECRET**: MUST be identical between API and frontend
2. **REDIS_URL**: Must be Upstash URL, not localhost
3. **NODE_ENV**: Must be `production` (not development)
4. **CORS**: Must include your Vercel frontend URL
5. **Encryption keys**: Keep these secret and secure

---

## 🆘 Troubleshooting

### **If deployment still fails with Redis error:**

Check that:
1. REDIS_URL is correctly formatted: `redis://:password@hostname:port`
2. Upstash database is active and accessible
3. No .env.local file is overriding production values

### **If OAuth errors persist:**

OAuth is optional. If you're not using social login, you can ignore the OAuth warnings. The app will work fine without it.

### **If deployment takes too long:**

The first deployment after adding variables may take 2-3 minutes. Be patient.

---

## 📊 Cost Reminder

- **Upstash Redis**: Free tier (10K commands/day)
- **Neon PostgreSQL**: Free tier (0.5GB storage)
- **DigitalOcean App Platform**: $12/month (covered by credits)

**Total additional cost**: $0/month (using free tiers)

---

## ✅ Quick Setup Script

Copy this template and fill in your values:

```bash
# Save this as setup-env-vars.txt

REDIS_URL=redis://:PASTE_YOUR_UPSTASH_PASSWORD_HERE@PASTE_HOSTNAME_HERE:PASTE_PORT_HERE
DATABASE_URL=postgresql://PASTE_YOUR_NEON_URL_HERE
JWT_SECRET=PASTE_48_CHAR_SECRET_HERE
JWT_REFRESH_SECRET=PASTE_48_CHAR_SECRET_HERE
ENCRYPTION_KEY=PASTE_32_CHAR_KEY_HERE
OAUTH_TOKEN_ENCRYPTION_KEY=PASTE_32_CHAR_KEY_HERE
NODE_ENV=production
API_CORS_ORIGIN=https://your-app.vercel.app
```

Then add each line to DigitalOcean App Platform → Settings → Environment Variables.

---

Once you've added all the environment variables, the deployment will succeed! 🚀
