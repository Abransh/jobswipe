# JobSwipe Frontend Architecture - ACTUAL IMPLEMENTATION

## 🎯 Overview

This document describes the **actual, working implementation** of JobSwipe's frontend architecture (not theoretical). Last updated after comprehensive codebase analysis.

---

## 📱 View Modes

JobSwipe offers **3 distinct view modes** for job discovery, each with its own implementation:

### 1. **Swipe View** (Tinder-like)
**Component**: `apps/web/src/components/jobs/JobDiscovery/JobSwipeInterface.tsx`

**Implementation**:
- Uses framer-motion for drag animations
- Stacked card interface (shows 3 cards)
- **API Integration**: Direct calls to `jobsApi.swipeRight()` at line 121
- **Left Swipe**: Lines 48-90 - Records preference via API
- **Right Swipe**: Lines 92-200 - Triggers job application automation

**Flow**:
```
User Swipes Right
→ handleSwipeRight(jobId) called
→ jobsApi.swipeRight(job.id, metadata, { priority })
→ POST /api/v1/jobs/{jobId}/swipe
→ Backend automation or desktop queue
→ Success feedback + remaining apps count
```

### 2. **List View**
**Component**: `apps/web/src/components/jobs/JobDiscovery/JobListInterface.tsx`

**Implementation**:
- Uses `JobCard` component for each job
- Traditional vertical list layout
- **API Integration**: Calls `jobsApi.swipeRight()` at line 58
- **Handler**: `handleJobApply()` manages the application flow

**Flow**:
```
User Clicks "Apply" on JobCard
→ JobCard.onApply() callback
→ JobListInterface.handleJobApply()
→ jobsApi.swipeRight()
→ POST /api/v1/jobs/{jobId}/swipe
→ Backend automation
```

### 3. **Grid View**
**Component**: `apps/web/src/components/jobs/JobDiscovery/JobGridInterface.tsx`

**Implementation**:
- Uses `JobCard` component in grid layout
- 2-3 column responsive grid
- **API Integration**: Calls `jobsApi.swipeRight()` at line 58
- **Handler**: `handleJobApply()` manages the application flow

---

## 🔌 API Integration Layer

### **Jobs API Client**
**File**: `apps/web/src/lib/api/jobs.ts`

**Key Methods**:

```typescript
// Primary swipe method
jobsApi.swipeJob(jobId: string, request: SwipeJobRequest)
  → POST http://localhost:3001/api/v1/jobs/{jobId}/swipe

// Convenience methods
jobsApi.swipeRight(jobId, metadata, options)
jobsApi.swipeLeft(jobId, metadata)
```

**Features**:
- ✅ Automatic token refresh on 401
- ✅ HTTPOnly cookie handling via server bridge
- ✅ Comprehensive error handling
- ✅ Detailed console logging
- ✅ Browser metadata injection

### **API Flow**:

```
Frontend Component
  ↓
jobsApi.swipeRight(jobId, metadata, { priority })
  ↓
apiRequest() → getAuthHeaders() → getAuthToken()
  ↓ (3 methods tried)
  1. Auth service (globalThis.__authService)
  2. Server bridge (/api/auth/token)
  3. SessionStorage fallback
  ↓
POST /api/v1/jobs/{jobId}/swipe
  ↓
Fastify Backend (apps/api/)
  ↓
AutomationLimits.checkServerEligibility()
  ↓
┌─────────────┴─────────────┐
│                           │
Free Tier (< 15 apps)     Limit Reached
│                           │
ServerAutomationService   Desktop Queue
↓                           ↓
ProxyRotator.getNextProxy() Queue for desktop app
↓
Python Automation (browser-use)
↓
Apply to job on company site
```

---

## 🎛️ State Management

### **Component-Level State**:

Each view component manages its own state:

```typescript
// JobSwipeInterface
const [currentIndex, setCurrentIndex] = useState(0);
const [isApplying, setIsApplying] = useState<string | null>(null);
const [feedback, setFeedback] = useState<...>(null);
const [swipeStats, setSwipeStats] = useState({
  totalSwipes: 0,
  leftSwipes: 0,
  rightSwipes: 0
});

// JobListInterface & JobGridInterface
const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());
const [applicationStats, setApplicationStats] = useState({
  totalApplications: 0,
  todayApplications: 0,
  successRate: 0
});
```

### **Parent Page State**:

The main `/jobs` page (`apps/web/src/app/jobs/page.tsx`) manages:
- View mode selection (swipe/list/grid)
- Filters and search query
- Application statistics
- Jobs data (via useJobs hook)

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     /jobs Page (page.tsx)                │
│  - View mode state                                       │
│  - Filters & search                                      │
│  - Jobs data (useJobs hook)                             │
└────────────┬──────────────────────────────────┬─────────┘
             │                                   │
   ┌─────────┴──────────┐          ┌───────────┴────────────┐
   │  View Mode = swipe │          │ View Mode = list/grid  │
   └─────────┬──────────┘          └───────────┬────────────┘
             │                                  │
             ▼                                  ▼
┌──────────────────────────┐      ┌─────────────────────────┐
│  JobSwipeInterface       │      │ JobList/GridInterface   │
│  - Framer-motion cards   │      │ - JobCard components    │
│  - Direct API calls      │      │ - Handles API calls     │
└────────┬─────────────────┘      └────────┬────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌───────────────────────────────────────────────────────────┐
│              jobsApi.swipeRight() (jobs.ts)                │
│  - Token management                                        │
│  - HTTP client                                             │
│  - Error handling                                          │
└───────────┬───────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────┐
│        Fastify API: POST /api/v1/jobs/{jobId}/swipe       │
│  - Authentication                                          │
│  - Tier checking                                           │
│  - Automation routing                                      │
└───────────┬───────────────────────────────────────────────┘
            │
            ├──────────────┬─────────────────┐
            │              │                 │
            ▼              ▼                 ▼
    ServerAutomation   Desktop Queue   Already Applied
    (with proxy)       (limit reached)  (409 error)
```

---

## 🔐 Authentication Flow

```
1. User attempts to swipe
   ↓
2. jobsApi.getAuthToken() tries 3 methods:

   Method 1: Auth Service (globalThis.__authService)
   Method 2: Server Bridge (/api/auth/token - reads HTTPOnly cookies)
   Method 3: SessionStorage (development fallback)
   ↓
3. Token included in Authorization header
   ↓
4. If 401: Automatic refresh attempt
   ↓
5. Retry with new token (max 1 retry)
   ↓
6. If still 401: Show "Please log in" message
```

---

## 🎨 User Feedback System

All three view modes provide consistent feedback:

### **Success Messages**:
```typescript
"Application queued for {job.title}! 🚀 ({X} server apps remaining)"
```

### **Error Messages**:
- 401: "Please log in to apply to jobs."
- 409: "You have already applied to this job."
- 429: "Too many applications. Please wait a moment."
- Proxy error: "Server automation unavailable. Try again or use desktop app."
- Network: "Network error. Please check your connection."
- Default: "Failed to apply to job. Please try again."

### **Visual Feedback**:
- Loading spinner while applying (`isApplying` state)
- Success: Green toast notification (5 seconds)
- Error: Red toast notification (5 seconds)
- Application count badge in header

---

## 📝 Logging System

Comprehensive console logging added for debugging:

### **Swipe View Logs**:
```
🔵 [SWIPE START] - When user initiates swipe
🟡 [API CALL] - Before making API request
🟢 [API RESPONSE] - After successful API response
🔴 [API ERROR] - On any errors
✅ [SWIPE COMPLETE] - After successful application
👈 [SWIPE LEFT] - For left swipes
```

### **List/Grid View Logs**:
```
🔵 [APPLY START - LIST VIEW/GRID VIEW]
🟡 [API CALL - LIST VIEW/GRID VIEW]
🟢 [API RESPONSE - LIST VIEW/GRID VIEW]
🔴 [API ERROR - LIST VIEW/GRID VIEW]
✅ [APPLY COMPLETE - LIST VIEW/GRID VIEW]
```

### **API Client Logs**:
```
🌐 [Jobs API Client] Initiating swipe
✅ [Jobs API Client] Swipe successful
❌ [Jobs API Client] Swipe failed
🔄 [Jobs API] Token refresh successful
```

---

## 🏗️ Component Architecture

### **NOT USED** (Found in codebase but inactive):

❌ `apps/web/src/components/jobs/JobSwipe/JobSwipeContainer.tsx`
❌ `apps/web/src/components/jobs/hooks/useJobSwipe.ts`

These components use a callback-based architecture but are **not connected to the actual pages**.

### **ACTUALLY USED** (Active implementation):

✅ `JobSwipeInterface` - Swipe view with direct API calls
✅ `JobListInterface` - List view with JobCard components
✅ `JobGridInterface` - Grid view with JobCard components
✅ `JobCard` - Reusable card component (used in list/grid)
✅ `jobsApi` - Centralized API client

---

## 🚀 Performance Optimizations

1. **Lazy Loading**: Jobs loaded in batches (useJobs hook)
2. **Memoization**: useCallback for event handlers
3. **Optimistic Updates**: UI updates immediately, API called async
4. **Error Recovery**: Stats reverted on API failures
5. **Debouncing**: Search and filters debounced
6. **Card Stack**: Only renders 3 cards at a time in swipe view

---

## 🧪 Testing Recommendations

### **Manual Testing**:
1. Open `/jobs` page
2. Open browser console (F12)
3. Swipe/click to apply
4. Watch for logs:
   - 🔵 START log should appear
   - 🟡 API CALL log with endpoint
   - 🟢 RESPONSE log with remainingApps count
   - ✅ COMPLETE log

### **Error Testing**:
1. Apply to same job twice → Should show "already applied"
2. Apply 15 times (free tier) → 16th should queue for desktop
3. Turn off network → Should show network error
4. Invalid token → Should attempt refresh

---

## 🔄 Migration Notes

If integrating the unused `JobSwipeContainer`:

```typescript
// Currently NOT used, but could be integrated:
<JobSwipeContainer
  jobs={jobs}
  onSwipeRight={(job, analytics) => {
    // Need to add API call here:
    jobsApi.swipeRight(job.id, metadata);
  }}
  onSwipeLeft={(job, analytics) => {
    jobsApi.swipeLeft(job.id, metadata);
  }}
/>
```

**Status**: Not recommended - current implementation is simpler and working.

---

## 📦 Key Files Reference

### **Frontend Components**:
- `/apps/web/src/components/jobs/JobDiscovery/JobSwipeInterface.tsx` ⭐
- `/apps/web/src/components/jobs/JobDiscovery/JobListInterface.tsx` ⭐
- `/apps/web/src/components/jobs/JobDiscovery/JobGridInterface.tsx` ⭐
- `/apps/web/src/components/jobs/JobCard/JobCard.tsx` ⭐
- `/apps/web/src/lib/api/jobs.ts` ⭐
- `/apps/web/src/app/jobs/page.tsx` ⭐

### **Backend**:
- `/apps/api/src/routes/jobs.routes.ts` - API endpoint
- `/apps/api/src/services/ServerAutomationService.ts` - Automation logic
- `/apps/api/src/services/AutomationLimits.ts` - Free tier limits
- `/apps/api/src/services/ProxyRotator.ts` - Proxy management

---

## ✅ Summary

**What Works** ✅:
- All 3 view modes make API calls correctly
- Authentication with automatic token refresh
- Error handling with user-friendly messages
- Remaining apps count displayed to users
- Comprehensive logging for debugging
- Free tier limit enforcement (15 apps)
- Proxy rotation for server automation

**What Doesn't Exist** ❌:
- JobSwipeContainer is not wired to API
- useJobSwipe hook is not used in production
- Desktop automation is separate (Electron IPC)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-14
**Status**: ✅ Production-accurate documentation
