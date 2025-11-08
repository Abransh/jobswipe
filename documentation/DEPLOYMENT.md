# JobSwipe API Deployment Guide

## DigitalOcean App Platform Deployment

### Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **DigitalOcean Account**: Sign up at [DigitalOcean](https://digitalocean.com)
3. **Domain Name** (optional): For custom domain setup

### Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify the build works locally**:
   ```bash
   pnpm run build:api
   ```

### Step 2: Deploy to DigitalOcean App Platform

#### Quick Setup (Recommended)

1. **Login to DigitalOcean**:
   - Go to [DigitalOcean Console](https://cloud.digitalocean.com)
   - Navigate to **Apps** section

2. **Create New App**:
   - Click **"Create App"**
   - Choose **"GitHub"** as source
   - Select your repository and branch (usually `main`)

3. **Configure Service**:
   - **Name**: `jobswipe-api`
   - **Source Directory**: `/apps/api`
   - **Build Command**: `pnpm run build:production`
   - **Run Command**: `node dist/index.js`
   - **Port**: `3001`

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   API_PORT=3001
   API_HOST=0.0.0.0
   DATABASE_URL=[your-database-url]
   JWT_SECRET=[generate-with-openssl-rand-base64-64]
   ```

5. **Deploy**:
   - Click **"Create Resources"**
   - Wait for deployment to complete (5-10 minutes)

### Step 3: Verify Deployment

1. **Check Health Endpoint**:
   ```bash
   curl https://your-app-url.ondigitalocean.app/health
   ```

2. **Expected Response**:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "version": "1.0.0",
     "environment": "production",
     "uptime": 123
   }
   ```

### Troubleshooting

1. **Build Fails**: Test `pnpm run build:api` locally first
2. **Environment Variables**: Verify all required variables are set
3. **CORS Errors**: Update `API_CORS_ORIGIN` with your frontend domains

### Essential Environment Variables

```bash
# Required
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0

# Security (generate strong secrets)
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# Database (if using)
DATABASE_URL=postgresql://user:pass@host:port/db

# CORS (your frontend domains)
API_CORS_ORIGIN=https://yourdomain.com
```

## Quick Commands

```bash
# Test build locally
pnpm run build:api

# Start production server locally
NODE_ENV=production node dist/index.js

# Health check
curl http://localhost:3001/health
```

Your API will be available at: `https://your-app-url.ondigitalocean.app`