# JobSwipe Web App - Authentication Setup Guide

## 🔐 Overview

The JobSwipe web application uses a custom JWT-based authentication system with the following features:

- **HTTP-only cookies** for secure token storage
- **Access & refresh tokens** for session management
- **Server-side JWT verification** in Next.js middleware
- **Client-side auth context** for UI state
- **Public job browsing** with action-level authentication

## 🚀 Quick Setup

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

**CRITICAL:** Set the JWT_SECRET (must match the API server):

```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env.local
JWT_SECRET=<generated-secret>
NEXT_PUBLIC_JWT_SECRET=<same-secret>
```

### 2. Configure API Connection

```bash
# In .env.local
API_URL=http://localhost:3001
API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the Development Server

```bash
npm run dev
```

## 🔑 How Authentication Works

### Login Flow

```
1. User submits login form
   ↓
2. Web app → /api/auth/login (Next.js API route)
   ↓
3. API route → Fastify API server (/api/v1/auth/login)
   ↓
4. Fastify validates credentials & generates JWT tokens
   ↓
5. API route receives tokens & user data
   ↓
6. API route sets HTTP-only cookies (accessToken, refreshToken)
   ↓
7. User redirected to /jobs page
   ↓
8. Client-side auth context updates
```

### Route Protection

#### Public Routes (No Auth Required)
- `/` - Landing page
- `/about` - About page
- `/jobs` - **Job browsing** (auth required only for swiping)
- `/pricing` - Pricing page
- `/help` - Help center

#### Protected Routes (Auth Required)
- `/dashboard` - User dashboard
- `/dashboard/applications` - Application tracking
- `/dashboard/resumes` - Resume management
- `/dashboard/saved` - Saved jobs
- `/profile` - User profile
- `/settings` - Account settings
- `/automation` - Automation settings

### Action-Level Authentication

The `/jobs` page is **publicly accessible** but requires authentication for certain actions:

```typescript
// User can browse jobs without login
✅ View job cards
✅ See job details
✅ Navigate between jobs

// Authentication required
🔒 Swipe right (apply to job)
🔒 Save job for later
🔒 Share job application
```

When an unauthenticated user tries to swipe:
1. Login prompt modal appears
2. User signs in/up
3. Redirected back to /jobs
4. Swipe action is automatically executed
5. Application is queued

## 🛠️ Troubleshooting

### Issue 1: "Can access /jobs but not other pages when logged in"

**Symptom:** User logs in successfully, can access /jobs, but gets redirected to login when accessing /dashboard or other protected routes.

**Causes & Solutions:**

1. **JWT_SECRET mismatch**
   ```bash
   # Check if JWT_SECRET matches between web app and API server
   # In apps/web/.env.local
   JWT_SECRET=same-secret-as-api-server
   NEXT_PUBLIC_JWT_SECRET=same-secret-as-api-server
   ```

2. **Cookies not persisting**
   ```bash
   # Check browser DevTools → Application → Cookies
   # Should see:
   # - accessToken (httpOnly, secure in production)
   # - refreshToken (httpOnly, secure in production)

   # If cookies are missing, check:
   # - Browser is not blocking cookies
   # - Domain/path settings are correct
   # - SameSite policy is compatible
   ```

3. **Environment variable not loaded**
   ```bash
   # Restart Next.js dev server after changing .env.local
   npm run dev

   # Check middleware logs in terminal:
   # Should NOT see: "JWT_SECRET not configured"
   ```

### Issue 2: "Login redirect not working"

**Symptom:** After login, user is not redirected to /jobs.

**Solution:** This should be working by default. Check:

```typescript
// In EnhancedSignInForm.tsx - already configured
const callbackUrl = searchParams.get('callbackUrl') || '/jobs';
```

If the issue persists:
1. Clear browser cache
2. Check console for JavaScript errors
3. Verify router.push() is not being blocked

### Issue 3: "Swipe requires login but doesn't redirect back"

**Symptom:** After logging in from swipe prompt, user is not redirected back to /jobs.

**Solution:** This is handled automatically via:

```typescript
// LoginPromptModal.tsx - already configured
const handleSignIn = () => {
  router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/jobs')}`);
};
```

The swipe action is stored in sessionStorage and executed after login:

```typescript
// JobSwipeInterface.tsx
sessionStorage.setItem('pending_swipe_job_id', jobId);
```

## 📋 Debugging Checklist

When authentication is not working:

- [ ] Check browser console for errors
- [ ] Check Network tab for API request failures
- [ ] Check Application → Cookies for accessToken and refreshToken
- [ ] Check terminal logs for middleware errors
- [ ] Verify JWT_SECRET is set in .env.local
- [ ] Verify JWT_SECRET matches API server
- [ ] Restart Next.js dev server
- [ ] Clear browser cache and cookies
- [ ] Try incognito/private browsing mode

## 🔍 Middleware Logging

In development mode, the middleware logs authentication attempts:

```
[Middleware] /dashboard - Auth: SUCCESS
  user: user@example.com
  hasCookies: true
  cookieNames: ['accessToken', 'refreshToken']
```

```
[Middleware] /dashboard - Auth: FAILED
  error: Token has expired
  hasCookies: true
  cookieNames: ['accessToken', 'refreshToken']
```

## 🎯 Testing Authentication

### Test Public Access
```bash
# Should work without login
curl http://localhost:3000/jobs
```

### Test Protected Routes
```bash
# Should redirect to /auth/signin
curl -L http://localhost:3000/dashboard
```

### Test Login Flow
1. Open http://localhost:3000/auth/signin
2. Enter valid credentials
3. Should redirect to /jobs
4. Click "Dashboard" in sidebar
5. Should access dashboard (not redirect to login)

### Test Swipe Authentication
1. Open http://localhost:3000/jobs (without login)
2. Swipe right on a job
3. Should see login prompt modal
4. Click "Sign in" or "Create account"
5. Complete authentication
6. Should redirect back to /jobs
7. Application should be queued automatically

## 🔒 Security Best Practices

1. **Never commit .env.local** - Already in .gitignore
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS in production** - Cookies marked `secure: true`
4. **Rotate secrets regularly** - Update JWT_SECRET periodically
5. **Monitor failed auth attempts** - Check middleware logs
6. **Use HTTP-only cookies** - Already configured
7. **Implement rate limiting** - Configure in API server

## 📚 Related Files

- `apps/web/src/middleware.ts` - Next.js middleware for route protection
- `apps/web/src/lib/auth/middleware-auth.ts` - JWT verification logic
- `apps/web/src/app/api/auth/login/route.ts` - Login API proxy
- `apps/web/src/hooks/useAuth.ts` - Client-side auth hook
- `apps/web/src/components/auth/enhanced/EnhancedSignInForm.tsx` - Sign in form
- `apps/web/src/components/auth/LoginPromptModal.tsx` - Swipe login prompt
- `apps/web/src/components/jobs/JobDiscovery/JobSwipeInterface.tsx` - Swipe interface

## 🆘 Getting Help

If you're still experiencing issues:

1. Check the server logs (both Next.js and Fastify API)
2. Review the middleware logs in the terminal
3. Check browser DevTools console
4. Verify environment variables are loaded
5. Test with a fresh browser session
6. Consult the main CLAUDE.md for architecture details
