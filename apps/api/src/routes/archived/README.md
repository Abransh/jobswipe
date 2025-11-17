# Archived Authentication Routes

## Purpose
This directory contains authentication route files that have been archived and are **NO LONGER IN USE**.

## Archived Files

### `production-auth.routes.ts`
**Archived Date:** 2025-11-13
**Reason:** Duplicate/competing implementation with auth.routes.ts

#### Why It Was Archived
During a comprehensive codebase audit, we discovered two competing authentication implementations:

1. **auth.routes.ts** (ACTIVE) - Currently registered and used in production
2. **production-auth.routes.ts** (UNUSED) - Never imported or registered in index.ts

#### Analysis Findings

**Production-auth.routes.ts had:**
- ✅ Better security features (account lockout after 5 failed attempts, 30-min lockout)
- ✅ More mature password reset implementation
- ✅ Login attempt tracking
- ❌ Fewer endpoints (no email check, desktop token exchange, password change)
- ❌ No session service integration
- ❌ Cookie-based token management (less flexible)

**Auth.routes.ts has:**
- ✅ Full endpoint coverage (email check, desktop exchange, profile, password change)
- ✅ Session service integration for better session management
- ✅ More flexible token management (body + headers + cookies)
- ✅ Better integration with shared packages
- ✅ Desktop app token exchange support
- ❌ Missing account lockout security
- ❌ Missing login attempt tracking

#### Migration Strategy
Instead of maintaining two separate implementations, we:

1. **Kept auth.routes.ts as the base** (clients depend on it)
2. **Extracted best features from production-auth.routes.ts:**
   - Account lockout logic
   - Login attempt tracking
   - Enhanced password reset
3. **Merged into unified auth.unified.routes.ts**
4. **Archived this file** for historical reference

#### Security Features Worth Preserving

```typescript
// Account Lockout (from production-auth.routes.ts)
const loginAttempts = user.loginAttempts + 1;
const shouldLock = loginAttempts >= 5;

await fastify.db.user.update({
  where: { id: user.id },
  data: {
    loginAttempts,
    lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null
  },
});

// Check lockout status
if (user.lockedUntil && user.lockedUntil > new Date()) {
  return reply.code(401).send({
    success: false,
    error: 'Account is temporarily locked',
    errorCode: 'ACCOUNT_LOCKED',
  });
}
```

#### Database Schema Support
The Prisma schema already includes all required fields:
- `loginAttempts` (Int, default 0)
- `lockedUntil` (DateTime?)
- `lastLoginAt` (DateTime?)
- `emailVerified` (DateTime?)
- `dataConsent` (Boolean)
- All necessary indexes

## Important Notes

⚠️ **DO NOT use files in this directory** - They are here for historical reference only

✅ **Use auth.routes.ts or auth.unified.routes.ts** - These are the active implementations

📝 **For authentication changes** - Refer to the comprehensive authentication merge plan in project documentation

## Related Documentation
- Authentication Merge Plan: `/docs/architecture/auth-system-merge.md` (to be created)
- API Documentation: Swagger/OpenAPI at `/api/docs`
- Security Analysis: See comprehensive architectural report from 2025-11-13
