# 🔧 Vercel Build Error: "No Next.js version detected"

## Error Message
```
Error: No Next.js version detected. Make sure your package.json has "next"
in either "dependencies" or "devDependencies". Also check your Root Directory
setting matches the directory of your package.json file.
```

## Root Cause
Vercel is looking for Next.js in the repository root, but in our monorepo, Next.js is installed in `apps/web/package.json`.

---

## ✅ Solution: Update Vercel Project Settings

### **Step 1: Go to Project Settings**

1. Open https://vercel.com/dashboard
2. Select your `jobswipe-web` project
3. Click **Settings** (top navigation)

### **Step 2: Update Root Directory**

1. Scroll to **Build & Development Settings**
2. Find **Root Directory** setting
3. Click **Edit**
4. Change from `.` to: `apps/web`
5. Click **Save**

### **Step 3: Clear Build Settings (Important)**

Since we're using `vercel.json`, clear these fields:

**Build Command:**
- Leave **EMPTY** (uses vercel.json)

**Output Directory:**
- Leave **EMPTY** (uses vercel.json)

**Install Command:**
- Leave **EMPTY** (uses vercel.json)

**Development Command:**
- Leave **EMPTY** (uses vercel.json)

### **Step 4: Redeploy**

1. Go to **Deployments** tab
2. Click **Redeploy** on the failed deployment
3. Or trigger new deployment: `vercel --prod --cwd apps/web`

---

## 📋 Correct Vercel Configuration

Your Vercel project settings should look like this:

```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: (empty - uses vercel.json)
Output Directory: (empty - uses vercel.json)
Install Command: (empty - uses vercel.json)
Node.js Version: 20.x
```

---

## 🔍 Why This Works

When Root Directory is set to `apps/web`:
1. Vercel starts in `/apps/web` directory
2. Finds `package.json` with Next.js dependency ✅
3. Reads `vercel.json` for build configuration
4. Build command: `cd ../..` → goes to monorepo root
5. Installs dependencies from root
6. Builds workspace packages in order
7. Returns to `/apps/web/.next` for deployment

---

## 🚨 Alternative: Update vercel.json (If Root Directory Must Be Root)

If you need to keep Root Directory as `.` (root), update `apps/web/vercel.json`:

```json
{
  "version": 2,
  "name": "jobswipe-web",
  "buildCommand": "pnpm install --frozen-lockfile --ignore-scripts && cd packages/database && pnpm run db:generate && cd ../.. && pnpm --filter @jobswipe/shared build && pnpm --filter @jobswipe/database build && pnpm --filter @jobswipe/web build",
  "devCommand": "pnpm run dev:web",
  "installCommand": "npm install -g pnpm@latest && echo 'pnpm installed globally'",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Changes:**
- Remove `cd ../..` from buildCommand (already at root)
- Change outputDirectory to `apps/web/.next`
- Change devCommand to `pnpm run dev:web`

---

## ✅ Verification

After fixing, your build should show:

```
✓ Installing pnpm
✓ Installing dependencies
✓ Generating Prisma Client
✓ Building @jobswipe/shared
✓ Building @jobswipe/database
✓ Building @jobswipe/web
✓ Detected Next.js version: 15.0.0
✓ Creating optimized production build
✓ Compiled successfully
```

---

## 🎯 Quick Fix Commands

### **Option 1: Via Vercel CLI**
```bash
# Link project (if not already linked)
cd apps/web
vercel link

# Deploy with correct settings
vercel --prod
```

### **Option 2: Via Dashboard**
Follow Step 1-4 above, then click **Redeploy**.

---

## 📞 Still Having Issues?

**Check these:**
1. Root Directory is exactly `apps/web` (no leading/trailing slashes)
2. Build command fields are EMPTY (to use vercel.json)
3. Environment variables are set
4. pnpm-lock.yaml is committed to repository
5. vercel.json exists in apps/web directory

**Debug build locally:**
```bash
# From repository root
cd apps/web
vercel build --prod --debug
```

This will show exactly what Vercel sees during deployment.
