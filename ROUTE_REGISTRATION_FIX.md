# 🚨 Route Registration Duplicate Error - Fix Guide

## 📊 Problem Summary

**Error**: `Method 'POST' already declared for route '/api/v1/auth/login'`

**Root Cause**: Resume routes plugin is invalid (exports object instead of function), causing registration to fail, which triggers fallback to basic routes, causing duplicate registration.

---

## 🔍 Detailed Analysis

### Error Chain:
1. ✅ Enterprise routes load successfully (including resume routes)
2. ✅ Enterprise auth routes register successfully
3. ✅ Enterprise queue, jobs, automation, onboarding routes register successfully
4. ❌ **Resume routes registration fails**: `Plugin must be a function or a promise. Received: 'object'`
5. ❌ **Catch block executes**: Tries to register basic routes
6. ❌ **Duplicate route error**: Basic routes conflict with already-registered enterprise routes

### The Real Error:
```
[11:38:23 UTC] ERROR: Plugin must be a function or a promise. Received: 'object'
    err: {
      "type": "FastifyError",
      "message": "Plugin must be a function or a promise. Received: 'object'",
      "code": "AVV_ERR_PLUGIN_NOT_VALID",
```

This happens because your resume routes are not exported as a proper Fastify plugin.

---

## 🛠️ FIX #1: Remove Resume Routes (Quickest)

Since you commented out the resume routes file, you should also **remove the resume route registration** from `index.ts`.

### Step 1: Check what you added to `loadRoutes()` function

```bash
cd /Users/abranshbaliyan/jobswipe/apps/api/src
grep -n "resume\|Resume" index.ts
```

### Step 2: Comment out resume route import and registration

Find these lines in `index.ts` and comment them out:

**In `loadRoutes()` function** (around line 52-53):
```typescript
// const resumeRoutes = await import('./routes/resumes.routes');
// console.log('Resume routes loaded successfully');
```

**In the return statement** (around line 60):
```typescript
return {
  registerAuthRoutes,
  tokenExchangeRoutes: tokenExchangeRoutes.default,
  registerQueueRoutes,
  jobsRoutes: jobsRoutes.default,
  automationRoutes: automationRoutes.automationRoutes,
  registerOnboardingRoutes,
  // resumeRoutes: resumeRoutes.default  // COMMENT THIS OUT
};
```

**In route registration section** (around line 746-750):
```typescript
// // Enterprise resume routes
// server.log.info('Registering enterprise resume routes...');
// await server.register(routes.resumeRoutes, { prefix: apiPrefix });
```

### Step 3: Restart server

```bash
npm run dev
```

---

## 🛠️ FIX #2: Properly Export Resume Routes (If You Need Them)

If you DO need resume upload functionality, fix the export format in `resumes.routes.ts`.

### Correct Export Format:

**Option A: Default export as async function**
```typescript
// resumes.routes.ts
import { FastifyInstance } from 'fastify';

export default async function resumeRoutes(fastify: FastifyInstance) {
  // Your routes here
  fastify.post('/upload', async (request, reply) => {
    // ... upload logic
  });
}
```

**Option B: Named export with registration function**
```typescript
// resumes.routes.ts
import { FastifyInstance } from 'fastify';

export async function registerResumeRoutes(fastify: FastifyInstance) {
  fastify.post('/upload', async (request, reply) => {
    // ... upload logic
  });
}
```

### Then in `index.ts`:

**For Option A (default export):**
```typescript
// In loadRoutes():
const resumeRoutes = await import('./routes/resumes.routes');

return {
  // ... other routes
  resumeRoutes: resumeRoutes.default  // Use .default for default export
};

// In registration:
await server.register(routes.resumeRoutes, { prefix: `${apiPrefix}/resumes` });
```

**For Option B (named export):**
```typescript
// In loadRoutes():
const { registerResumeRoutes } = await import('./routes/resumes.routes');

return {
  // ... other routes
  registerResumeRoutes
};

// In registration:
await server.register(async function (fastify) {
  await routes.registerResumeRoutes(fastify);
}, { prefix: `${apiPrefix}/resumes` });
```

---

## 🎯 RECOMMENDED SOLUTION

**Right now, use FIX #1** (remove resume routes registration) because:
1. You already commented out the resume routes file
2. The server will start immediately
3. You can work on other features
4. Resume upload is not critical for testing login/dashboard

**Later, when you need resume upload:**
1. Uncomment the resume routes file
2. Fix the export format (use FIX #2)
3. Re-enable the registration in index.ts

---

## ✅ Verification Steps

After applying the fix:

1. **Check for git diff:**
```bash
git diff apps/api/src/index.ts
```

2. **Start server:**
```bash
npm run dev
```

3. **Look for success message:**
```
✅ Enterprise routes registered successfully
🚀 JobSwipe API Server started successfully!
```

4. **Should NOT see:**
```
❌ Failed to start server: Method 'POST' already declared
❌ Plugin must be a function or a promise
```

---

## 🔧 Quick Commands

```bash
cd /Users/abranshbaliyan/jobswipe/apps/api

# Show what you changed in index.ts
git diff src/index.ts

# Find resume route references
grep -n "resume\|Resume" src/index.ts

# After commenting out resume routes, restart
npm run dev
```

---

## 💡 Why This Happened

1. You added AWS SDK packages
2. You uncommented or added resume route registration
3. The resume routes file exports an object, not a Fastify plugin function
4. Fastify's `server.register()` only accepts functions or promises
5. When it fails, the try-catch registers basic routes
6. Basic routes duplicate the already-registered enterprise routes

**This is a plugin export format issue, not an AWS SDK issue.**
