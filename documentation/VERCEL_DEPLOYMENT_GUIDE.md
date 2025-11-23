# 🚀 Deploy Frontend to Vercel - Step-by-Step Guide
## Next.js Web App Deployment

**Estimated Time:** 20-30 minutes
**Cost:** FREE (Hobby tier) or $20/month (Pro tier for production)
**Prerequisites:** GitHub account, Your DigitalOcean API deployed

---

## 📋 What You'll Deploy

Your Next.js web application (`apps/web/`) will be deployed to Vercel with:
- ✅ Global CDN (300+ edge locations worldwide)
- ✅ Automatic HTTPS & SSL
- ✅ Image optimization (automatic WebP/AVIF)
- ✅ Serverless functions
- ✅ Analytics built-in
- ✅ Zero-config deployment

---

## 🎯 **STEP 1: Get Your API URL** (2 min)

Before deploying frontend, you need your API URL from DigitalOcean.

### **Option A: If API is Already Deployed**

```bash
1. Go to: https://cloud.digitalocean.com/apps
2. Click on your API app
3. Copy the URL shown at the top
   Example: https://api-jobswipe-abc123.ondigitalocean.app

4. Save this URL - you'll need it in Step 4!
```

### **Option B: If API is Not Deployed Yet**

**STOP!** Deploy your API first following `PRODUCTION_SETUP_GUIDE.md`, then come back here.

**Why?** The frontend needs to know where the API is to make requests.

---

## 🎯 **STEP 2: Install Vercel CLI** (3 min)

### **Install via npm**

```bash
# Global install (recommended)
npm install -g vercel

# Verify installation
vercel --version
# Should show: Vercel CLI 33.x.x (or similar)
```

### **Alternative: Install via pnpm**

```bash
pnpm install -g vercel
```

### **Login to Vercel**

```bash
vercel login

# Follow the prompts:
# ? Log in to Vercel → Continue with GitHub (recommended)
#
# Browser will open → Click "Authorize Vercel"
# ✅ Success! GitHub authentication complete.
```

---

## 🎯 **STEP 3: Configure Frontend for Production** (5 min)

### **3.1: Create Vercel Configuration**

Navigate to your web app directory:

```bash
cd /home/user/jobswipe/apps/web
```

Create `vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm install && cd apps/web && pnpm run build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**Save this file:**

```bash
cat > vercel.json << 'EOF'
{
  "buildCommand": "cd ../.. && pnpm install && cd apps/web && pnpm run build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
EOF
```

### **3.2: Commit Vercel Config**

```bash
# From /home/user/jobswipe/apps/web
git add vercel.json
git commit -m "feat: Add Vercel configuration for production deployment"
git push origin main
```

---

## 🎯 **STEP 4: Deploy to Vercel** (10 min)

### **4.1: Initial Deployment**

From the `apps/web` directory:

```bash
cd /home/user/jobswipe/apps/web

# Start deployment
vercel
```

**You'll see this interactive prompt:**

```bash
? Set up and deploy "~/jobswipe/apps/web"? [Y/n]
→ Press Y (yes)

? Which scope do you want to deploy to?
→ Select your personal account (or team if you have one)

? Link to existing project? [y/N]
→ Press N (no, create new project)

? What's your project's name?
→ Type: jobswipe-web (or your preferred name)

? In which directory is your code located?
→ Press Enter (current directory: ./)

? Want to override the settings? [y/N]
→ Press N (use detected settings)
```

**Vercel will now:**
1. ✅ Detect Next.js framework automatically
2. ✅ Upload your code
3. ✅ Install dependencies with pnpm
4. ✅ Build your application
5. ✅ Deploy to a preview URL

**You'll get output like:**

```bash
🔗  Preview: https://jobswipe-web-abc123xyz.vercel.app
✅  Deployment ready!

To deploy to production, run:
  vercel --prod
```

### **4.2: Test Preview Deployment**

```bash
# Open the preview URL in browser
open https://jobswipe-web-abc123xyz.vercel.app

# Or if 'open' doesn't work:
# Just copy the URL and paste in your browser
```

**Expected issues on preview:**
- ❌ API calls will fail (we haven't set environment variables yet)
- ✅ UI should load
- ✅ Pages should render
- ✅ Navigation should work

**This is normal!** We'll fix it in the next step.

---

## 🎯 **STEP 5: Add Environment Variables** (5 min)

### **5.1: Via Vercel Dashboard (Recommended)**

```bash
1. Go to: https://vercel.com/dashboard

2. Click on your project: jobswipe-web

3. Go to: Settings → Environment Variables

4. Add these variables:
```

**Critical Environment Variables:**

```bash
# API Connection (REQUIRED)
NEXT_PUBLIC_API_URL
Value: https://your-api-url.ondigitalocean.app
Environments: ✅ Production, ✅ Preview, ✅ Development

# App URL (Update after custom domain)
NEXT_PUBLIC_APP_URL
Value: https://yourdomain.com
Environments: ✅ Production

# JWT Secret (must match API)
JWT_SECRET
Value: <same-as-your-api-jwt-secret>
Environments: ✅ Production

# Database (if web needs direct access - optional)
DATABASE_URL
Value: <your-neon-database-url>
Environments: ✅ Production
```

**Click "Save" after each variable!**

### **5.2: Via CLI (Alternative)**

```bash
# From apps/web directory:

# Add API URL
vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://your-api-url.ondigitalocean.app

# Add App URL
vercel env add NEXT_PUBLIC_APP_URL production
# Paste: https://yourdomain.com

# Add JWT Secret
vercel env add JWT_SECRET production
# Paste: your-jwt-secret

# Optional: Add database URL
vercel env add DATABASE_URL production
# Paste: your-database-url
```

---

## 🎯 **STEP 6: Deploy to Production** (3 min)

Now that environment variables are set, deploy to production:

```bash
# From apps/web directory:
cd /home/user/jobswipe/apps/web

# Deploy to production
vercel --prod
```

**Output:**

```bash
🔍  Inspect: https://vercel.com/your-account/jobswipe-web/abc123
✅  Production: https://jobswipe-web.vercel.app

📝  Deployed to production. Run `vercel --prod` to overwrite later on.
```

### **Test Production Deployment**

```bash
# Open production URL
open https://jobswipe-web.vercel.app

# Test functionality:
✅ Homepage loads
✅ Can navigate to /login
✅ Can navigate to /register
✅ API calls work (check browser console)
```

---

## 🎯 **STEP 7: Add Custom Domain** (Optional - 10 min)

### **7.1: Add Domain in Vercel**

```bash
1. Vercel Dashboard → Your Project → Settings → Domains

2. Click "Add Domain"

3. Enter your domain:
   - yourdomain.com
   - Click "Add"

4. Also add www subdomain:
   - www.yourdomain.com
   - Click "Add"
```

### **7.2: Configure DNS**

Vercel will show you DNS instructions. At your domain registrar (Namecheap, GoDaddy, etc.):

**Option A: Using CNAME (Recommended)**

```bash
Type    Name    Value                   TTL
──────────────────────────────────────────────
CNAME   @       cname.vercel-dns.com    3600
CNAME   www     cname.vercel-dns.com    3600
```

**Option B: Using A Records**

```bash
Type    Name    Value           TTL
──────────────────────────────────────
A       @       76.76.21.21     3600
CNAME   www     cname.vercel-dns.com    3600
```

### **7.3: Wait for DNS Propagation**

```bash
# Check DNS propagation (5-30 minutes)
# Visit: https://www.whatsmydns.net
# Enter: yourdomain.com
# Should show Vercel's IP addresses globally

# Or use command line:
dig yourdomain.com
# Should show: 76.76.21.21 (Vercel's IP)
```

### **7.4: Verify SSL Certificate**

```bash
1. Vercel automatically provisions SSL (Let's Encrypt)
2. Wait 5-10 minutes for certificate
3. Check in Vercel Dashboard → Domains
4. Should show: ✅ Valid Certificate

# Test HTTPS:
curl -I https://yourdomain.com
# Should return: HTTP/2 200
```

### **7.5: Update Environment Variables**

After domain is working, update your API URL references:

```bash
1. Vercel Dashboard → Settings → Environment Variables

2. Update NEXT_PUBLIC_APP_URL:
   Old: https://jobswipe-web.vercel.app
   New: https://yourdomain.com

3. Redeploy:
   vercel --prod
```

---

## 🎯 **STEP 8: Update API CORS Settings** (5 min)

Your API needs to allow requests from your new frontend domain.

### **8.1: Update DigitalOcean Environment Variables**

```bash
1. Go to: https://cloud.digitalocean.com/apps
2. Click your API app
3. Settings → Environment Variables
4. Find: API_CORS_ORIGIN
5. Update value to include your Vercel domain:

Before:
API_CORS_ORIGIN=https://localhost:3000

After:
API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://jobswipe-web.vercel.app

6. Click "Save"
7. DO will auto-redeploy your API (takes 2-3 minutes)
```

### **8.2: Test CORS**

```bash
# Open browser console on your frontend:
# Make an API call and check Network tab
# Should NOT see CORS errors

# Or test with curl:
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-api-url.ondigitalocean.app/api/v1/auth/login

# Should return:
# Access-Control-Allow-Origin: https://yourdomain.com
```

---

## 🎯 **STEP 9: Enable Vercel Analytics** (Optional - 2 min)

Get insights into your app's performance and usage:

```bash
1. Vercel Dashboard → Your Project

2. Click "Analytics" tab

3. Click "Enable Analytics"

4. Choose plan:
   - Free: 2,500 events/month
   - Pro: 100,000 events/month

5. View metrics:
   ✅ Page views
   ✅ Top pages
   ✅ Top referrers
   ✅ Devices & browsers
   ✅ Geographic distribution
```

---

## ✅ **VERIFICATION CHECKLIST**

After deployment, verify everything works:

### **Functional Tests:**

```bash
✅ Homepage loads correctly
✅ Navigation works (all pages accessible)
✅ Can view /login page
✅ Can view /register page
✅ Can register new user
✅ Can login with credentials
✅ Can view jobs list
✅ Can swipe on jobs
✅ Profile page loads
✅ Logout works
✅ Images load properly
✅ No CORS errors in console
✅ API calls succeed (check Network tab)
```

### **Performance Tests:**

```bash
# Use Lighthouse in Chrome DevTools:

1. Open your site: https://yourdomain.com
2. F12 → Lighthouse tab
3. Click "Analyze page load"

Target scores:
✅ Performance: > 90
✅ Accessibility: > 95
✅ Best Practices: > 95
✅ SEO: > 90
```

### **Security Tests:**

```bash
# Check HTTPS:
✅ URL shows padlock icon
✅ Certificate is valid
✅ No mixed content warnings

# Check headers:
curl -I https://yourdomain.com | grep -i "strict-transport-security"
# Should show: strict-transport-security: max-age=63072000
```

---

## 🔥 **TROUBLESHOOTING**

### **Issue: Build Fails on Vercel**

**Symptoms:** Deployment fails during build step

**Solutions:**

```bash
1. Check build logs in Vercel dashboard:
   Deployments → Click failed deployment → View logs

2. Common issues:

   A. Missing dependencies:
   → Add to apps/web/package.json
   → git commit and push

   B. Environment variable missing:
   → Add in Vercel dashboard → Settings → Environment Variables
   → Redeploy

   C. Build timeout:
   → Upgrade to Vercel Pro (longer timeout)
   → Or optimize build (remove unused dependencies)

3. Test build locally:
   cd apps/web
   pnpm run build
   # If this works, issue is with Vercel config
```

### **Issue: API Calls Fail (CORS Error)**

**Symptoms:** Browser console shows "blocked by CORS policy"

**Solutions:**

```bash
1. Check NEXT_PUBLIC_API_URL is set correctly:
   Vercel Dashboard → Settings → Environment Variables
   Should be: https://your-api-url.ondigitalocean.app

2. Update API CORS settings:
   DigitalOcean → Your API → Settings → Environment Variables
   API_CORS_ORIGIN should include your Vercel domain

3. Verify both domains:
   Frontend: https://yourdomain.com
   API: https://api.yourdomain.com (or DO URL)

4. Redeploy both:
   vercel --prod (frontend)
   DO will auto-redeploy (backend)
```

### **Issue: Environment Variables Not Working**

**Symptoms:** `process.env.NEXT_PUBLIC_API_URL` is undefined

**Solutions:**

```bash
1. Check variable name:
   ✅ Must start with NEXT_PUBLIC_ for client-side
   ❌ Without prefix = server-side only

2. Redeploy after adding variables:
   vercel --prod

3. Check in browser console:
   console.log(process.env.NEXT_PUBLIC_API_URL)
   Should show your API URL, not undefined

4. Clear Vercel cache:
   Settings → Advanced → Clear Build Cache
   Then redeploy
```

### **Issue: Images Not Loading**

**Symptoms:** Images show broken or don't load

**Solutions:**

```bash
1. Check next.config.js has image domains:

   // apps/web/next.config.js
   module.exports = {
     images: {
       domains: [
         'yourdomain.com',
         'nyc3.digitaloceanspaces.com', // Your DO Spaces
       ],
     },
   };

2. Use Next.js Image component:
   import Image from 'next/image'

   <Image
     src="/logo.png"
     alt="Logo"
     width={200}
     height={50}
   />

3. Check image paths are correct:
   ✅ /public/logo.png → Use /logo.png
   ❌ /public/logo.png → Don't use /public/logo.png
```

### **Issue: Slow Page Loads**

**Symptoms:** Pages take > 3 seconds to load

**Solutions:**

```bash
1. Enable Vercel Analytics:
   Check which pages are slow

2. Optimize images:
   Use Next.js Image component (auto-optimizes)

3. Enable caching:
   Add to next.config.js:

   module.exports = {
     swcMinify: true,
     compress: true,
   };

4. Use static generation:
   Add to page components:

   export const revalidate = 60; // Revalidate every 60 seconds

5. Check API response times:
   Slow API = slow frontend
   Optimize API queries
```

---

## 📊 **Monitoring Your Deployment**

### **Built-in Vercel Monitoring**

```bash
1. Dashboard: https://vercel.com/dashboard

2. Real-time metrics:
   ✅ Request count
   ✅ Response time
   ✅ Error rate
   ✅ Bandwidth usage

3. Deployment history:
   ✅ All deployments listed
   ✅ Can rollback to any version
   ✅ Preview each deployment
```

### **External Monitoring (Recommended)**

**UptimeRobot (Free)**

```bash
1. Go to: https://uptimerobot.com
2. Create monitor:
   - Type: HTTPS
   - URL: https://yourdomain.com
   - Interval: 5 minutes
   - Alert: Email + Slack
3. Get notified if site goes down
```

**Google Analytics (Optional)**

```bash
1. Create GA4 property
2. Get Measurement ID: G-XXXXXXXXXX
3. Add to Vercel environment variables:
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
4. Add to apps/web/app/layout.tsx:

   import Script from 'next/script'

   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
     strategy="afterInteractive"
   />
```

---

## 💰 **Cost Breakdown**

### **Vercel Hobby (Free)**

```bash
✅ Good for: Testing, personal projects
✅ Includes:
   - 100 GB bandwidth
   - 100 serverless function executions/day
   - Automatic HTTPS
   - Preview deployments
   - Analytics (2,500 events/month)

❌ Limitations:
   - Non-commercial use only
   - No team collaboration
   - Limited support
```

### **Vercel Pro ($20/month)**

```bash
✅ Good for: Production apps, startups
✅ Includes:
   - 1 TB bandwidth
   - Unlimited serverless executions
   - Team collaboration
   - Advanced analytics
   - Priority support
   - Commercial use allowed
   - Password protection
   - Custom domains (unlimited)

→ RECOMMENDED for production
```

### **Which to Choose?**

```bash
Start with Hobby (Free):
→ For testing and development
→ Can upgrade anytime

Upgrade to Pro when:
→ Ready to launch publicly
→ Need > 100GB bandwidth
→ Want team collaboration
→ Need priority support
→ Commercial use
```

---

## 🚀 **Post-Deployment Tasks**

### **1. Update README** (5 min)

Document your deployment URLs:

```markdown
## 🌐 Production URLs

- **Frontend**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Admin**: https://admin.yourdomain.com (if applicable)

## 🔗 Monitoring

- **Vercel Dashboard**: https://vercel.com/your-account/jobswipe-web
- **DigitalOcean**: https://cloud.digitalocean.com/apps
- **Uptime Monitor**: https://uptimerobot.com/dashboard
```

### **2. Set Up CI/CD** (Already done! ✅)

Vercel automatically deploys on git push:

```bash
✅ Push to main → Auto-deploy to production
✅ Push to other branch → Auto-deploy to preview
✅ Pull requests → Auto-deploy to preview with unique URL
```

### **3. Configure Preview Deployments**

```bash
1. Vercel Dashboard → Settings → Git

2. Production Branch: main

3. Preview Deployments:
   ✅ Enable for all branches
   ✅ Auto-deploy on push

4. Pull Request Comments:
   ✅ Enable (posts preview URL in PR)
```

### **4. Set Up Error Tracking** (Optional)

**Sentry Integration:**

```bash
1. Go to: https://sentry.io
2. Create project: jobswipe-web
3. Get DSN: https://xxx@sentry.io/123456
4. Install Sentry:
   cd apps/web
   pnpm add @sentry/nextjs

5. Add to environment variables:
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/123456

6. Configure in next.config.js

7. Errors auto-tracked!
```

---

## ✅ **SUCCESS CRITERIA**

Your deployment is successful when:

```bash
✅ Site loads at https://yourdomain.com
✅ All pages accessible
✅ API calls work (no CORS errors)
✅ User can register
✅ User can login
✅ User can browse jobs
✅ User can swipe on jobs
✅ Images load properly
✅ HTTPS works (padlock icon)
✅ Performance score > 90
✅ No console errors
✅ Mobile responsive
✅ Analytics tracking
```

---

## 🎉 **You're Live!**

Congratulations! Your frontend is now deployed on Vercel with:

✅ **Global CDN** - Fast loads worldwide
✅ **Automatic HTTPS** - Secure by default
✅ **Auto-deployments** - Push to deploy
✅ **Image optimization** - Automatic WebP/AVIF
✅ **Analytics** - Built-in insights
✅ **Zero downtime** - Rolling deployments

### **Next Steps:**

1. ✅ Test thoroughly
2. ✅ Monitor performance
3. ✅ Invite users for beta testing
4. ✅ Gather feedback
5. ✅ Iterate and improve

### **Need Help?**

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com (Pro plan)
- **Community**: https://github.com/vercel/next.js/discussions

---

**🚀 Your frontend is live! Share it with the world!**
