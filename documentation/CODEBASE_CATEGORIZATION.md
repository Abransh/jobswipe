# JOBSWIPE CODEBASE CATEGORIZATION
## Complete Feature & Functionality Organization

**Last Updated**: November 8, 2025
**Purpose**: Master categorization of all JobSwipe features for future development reference

---

## 📋 TABLE OF CONTENTS

1. [Authentication & Authorization](#1-authentication--authorization)
2. [User Management](#2-user-management)
3. [Job Management System](#3-job-management-system)
4. [Application Tracking](#4-application-tracking)
5. [Resume Management](#5-resume-management)
6. [Browser Automation](#6-browser-automation)
7. [Queue System](#7-queue-system)
8. [Real-time Communication](#8-real-time-communication)
9. [Security Features](#9-security-features)
10. [Monitoring & Logging](#10-monitoring--logging)
11. [Database & Data Models](#11-database--data-models)
12. [API Endpoints](#12-api-endpoints)
13. [Frontend Components](#13-frontend-components)
14. [Desktop Application](#14-desktop-application)
15. [Shared Services & Utilities](#15-shared-services--utilities)
16. [Subscription & Billing](#16-subscription--billing)
17. [Notifications](#17-notifications)
18. [Analytics & Reporting](#18-analytics--reporting)
19. [Company Integration](#19-company-integration)
20. [Developer Tools](#20-developer-tools)

---

## 1. AUTHENTICATION & AUTHORIZATION

### 📁 Files & Locations
- **API Routes**: `/apps/api/src/routes/auth.routes.ts`, `production-auth.routes.ts`
- **Services**: `/apps/api/src/services/AuthService.ts`
- **Shared**: `/packages/shared/src/services/frontend-auth.service.ts`
- **Context**: `/packages/shared/src/context/auth.context.ts`
- **Database**: `/packages/database/src/utils/auth.ts`
- **Middleware**: `/packages/shared/src/middleware/`

### 🎯 Features
- User registration with email verification
- User login with JWT tokens
- Password hashing (bcrypt)
- Token refresh mechanism
- Password reset/recovery
- Password change
- Session management (Redis)
- Device tracking
- IP tracking
- Failed login attempt tracking
- Account lockout after failed attempts
- Token exchange (web ↔ desktop)
- Role-based access control (RBAC)

### 📊 Database Models
- `User`
- `Account` (OAuth)
- `Session`
- `AuditLog` (auth events)

### 🔌 API Endpoints
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/reset-password`
- `POST /auth/change-password`
- `POST /auth/verify-email`
- `GET /auth/me`
- `POST /token-exchange`

### 🎨 UI Components
- SignInForm
- SignUpForm
- PasswordResetForm
- EmailVerificationForm
- OAuthProviders

---

## 2. USER MANAGEMENT

### 📁 Files & Locations
- **Database Models**: User, UserProfile, UserPreferences
- **API Routes**: User management within auth routes
- **Components**: `/apps/web/src/components/profile/`

### 🎯 Features
- User profile creation
- Profile editing
- User preferences configuration
- Profile visibility settings
- Account settings
- Email preferences
- Notification preferences
- Privacy settings
- Account deletion
- Data export (GDPR)

### 📊 Database Models
- `User`
- `UserProfile`
- `UserPreferences`

### 🔌 API Endpoints
- `GET /users/me`
- `PATCH /users/me/profile`
- `PATCH /users/me/preferences`
- `DELETE /users/me`
- `GET /users/me/export`

### 🎨 UI Components
- ProfileForm
- ProfileAvatar
- PreferencesForm
- SettingsPanel
- SecuritySettings
- NotificationPreferences

---

## 3. JOB MANAGEMENT SYSTEM

### 📁 Files & Locations
- **API Routes**: `/apps/api/src/routes/jobs.routes.ts`
- **Services**: `/apps/api/src/services/JobService.ts`
- **Components**: `/apps/web/src/components/jobs/`
- **API Clients**: `/apps/web/src/lib/api/jobs.ts`

### 🎯 Features
- Job search with advanced filters
- Job browsing/pagination
- Job details viewing
- Job swiping (Tinder-like UX)
- Save jobs for later
- Location-based search
- Salary range filtering
- Skill matching
- Job recommendations
- Job categorization
- Job status tracking

### 📊 Database Models
- `JobPosting`
- `JobSnapshot`
- `UserJobSwipe`
- `SavedJob`
- `JobCategory`

### 🔌 API Endpoints
- `GET /jobs` - Search jobs
- `GET /jobs/:id` - Get job details
- `POST /jobs/:id/swipe` - Swipe on job
- `POST /jobs/:id/save` - Save job
- `DELETE /jobs/:id/save` - Unsave job
- `GET /jobs/saved` - Get saved jobs

### 🎨 UI Components
- JobCard
- JobGrid
- JobList
- JobDetails
- JobFilters
- JobSearchBar
- SwipeInterface

---

## 4. APPLICATION TRACKING

### 📁 Files & Locations
- **Database Models**: JobApplication, ApplicationQueue, ApplicationInteraction
- **API Routes**: Application routes
- **Components**: `/apps/web/src/components/applications/`
- **Services**: Application management services

### 🎯 Features
- Application submission tracking
- Application status management
- Interview scheduling
- Interaction logging (calls, emails)
- Application timeline
- Application notes
- Status updates
- Application filtering
- Application statistics
- Success rate tracking

### 📊 Database Models
- `JobApplication`
- `ApplicationQueue`
- `ApplicationInteraction`
- `AutomationLog`

### 📊 Status States
- `PENDING`, `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`,
- `CANCELLED`, `RETRYING`, `PAUSED`, `REQUIRES_CAPTCHA`

### 🔌 API Endpoints
- `GET /applications` - List applications
- `GET /applications/:id` - Get details
- `POST /applications/:id/interactions` - Add interaction
- `PATCH /applications/:id` - Update status
- `GET /applications/:id/interviews` - List interviews

### 🎨 UI Components
- ApplicationList
- ApplicationCard
- ApplicationTimeline
- ApplicationStatus
- InteractionLog
- InterviewSchedule
- ApplicationStats

---

## 5. RESUME MANAGEMENT

### 📁 Files & Locations
- **API Routes**: `/apps/api/src/routes/resumes.routes.ts`
- **Database**: Resume models
- **Components**: `/apps/web/src/components/resume/`
- **Storage**: AWS S3 integration

### 🎯 Features
- Resume creation
- Resume editing
- Resume templates
- Resume preview
- Resume download (PDF, DOCX, HTML)
- AI resume enhancement
- Resume version control
- Job-specific resume tailoring
- Resume parsing
- Skills extraction

### 📊 Database Models
- `Resume`
- `ResumeTemplate`
- `ResumeEnhancement`

### 🔌 API Endpoints
- `GET /resumes` - List resumes
- `POST /resumes` - Create resume
- `GET /resumes/:id` - Get resume
- `PUT /resumes/:id` - Update resume
- `DELETE /resumes/:id` - Delete resume
- `POST /resumes/:id/enhance` - AI enhancement
- `POST /resumes/:id/download` - Download

### 🎨 UI Components
- ResumeEditor
- ResumeTemplateGallery
- ResumePreview
- ResumeDownload
- ResumeTailor

---

## 6. BROWSER AUTOMATION

### 📁 Files & Locations
- **Desktop App**: `/apps/desktop/companies/`
- **API Services**: `/apps/api/src/services/AutomationService.ts`
- **Python Scripts**: `/apps/desktop/companies/base/base_automation.py`
- **Plugins**: `/apps/api/src/plugins/automation.plugin.ts`

### 🎯 Features
- Headless browser automation (Playwright)
- Headful mode for CAPTCHAs
- Form analysis and filling
- Company-specific automation
- Captcha detection
- Proxy rotation
- Session management
- Form field mapping
- Result capture
- Screenshot capture
- Error recovery

### 🏢 Supported Companies
- LinkedIn
- Indeed
- Glassdoor
- Monster
- ZipRecruiter
- Greenhouse
- Lever
- Workday
- Generic (URL pattern detection)

### 📊 Database Models
- `AutomationLog`
- `AutomationProxy`

### 🔌 API Endpoints
- `POST /automation/trigger`
- `GET /automation/status`
- `POST /automation/captcha`
- `GET /automation/logs`

### 🛠️ Services
- AutomationService
- ServerAutomationService
- PythonAutomationService
- PythonBridge
- AutomationLimits

---

## 7. QUEUE SYSTEM

### 📁 Files & Locations
- **Plugin**: `/apps/api/src/plugins/queue.plugin.ts`
- **API Routes**: `/apps/api/src/routes/queue.routes.ts`
- **Technology**: BullMQ + Redis

### 🎯 Features
- Job queuing (BullMQ)
- Priority queue management
- Queue status tracking
- Worker management
- Job processing
- Retry logic (exponential backoff)
- Error handling
- Job claiming (desktop app)
- Queue monitoring
- Concurrency control

### 📊 Database Models
- `ApplicationQueue`

### 🔌 API Endpoints
- `POST /queue/applications` - Add to queue
- `GET /queue/status` - Queue status
- `GET /queue/jobs` - Get queued jobs
- `PATCH /queue/:id` - Update queue item
- `DELETE /queue/:id` - Cancel queue item
- `GET /queue/:id/logs` - Get logs

### ⚙️ Queue States
- PENDING, QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED, RETRYING, PAUSED

---

## 8. REAL-TIME COMMUNICATION

### 📁 Files & Locations
- **Plugin**: `/apps/api/src/plugins/websocket.plugin.ts`
- **Service**: `/apps/api/src/services/WebSocketService.ts`
- **Client**: `/apps/web/src/services/WebSocketClient.ts`
- **Technology**: Socket.IO + Redis adapter

### 🎯 Features
- WebSocket server (Socket.IO)
- User-specific rooms
- Application-specific rooms
- Broadcast events
- Authentication middleware
- Real-time job updates
- Real-time application status
- Queue status updates
- Automation progress updates
- Room management

### 📡 Events
- `application:update` - Application status change
- `queue:job-added` - New job in queue
- `automation:progress` - Automation progress
- `automation:complete` - Automation finished
- `job:new` - New job posted
- `notification:new` - New notification

---

## 9. SECURITY FEATURES

### 📁 Files & Locations
- **Plugins**:
  - `/apps/api/src/plugins/security.plugin.ts` (Basic)
  - `/apps/api/src/plugins/advanced-security.plugin.ts` (Advanced)
- **Services**: `/packages/shared/src/services/security-middleware.service.ts`
- **Utils**: `/packages/shared/src/utils/security.ts`

### 🎯 Features

#### A. Authentication Security
- JWT with RS256 algorithm
- HTTP-only cookies
- Refresh token rotation
- Token expiration (15 min access, 30 day refresh, 90 day desktop)
- Session binding
- Device tracking

#### B. API Security
- Rate limiting (100 req/15 min per IP)
- CORS policy configuration
- CSRF protection with token generation
- Input validation (Zod schemas)
- Security headers (HSTS, CSP, X-Frame-Options)
- XSS protection
- SQL injection prevention

#### C. Attack Detection
- Suspicious IP detection
- IP blocking after failed attempts
- XSS pattern detection
- SQL injection detection
- Path traversal prevention
- Command injection detection
- Brute force protection

#### D. Data Protection
- Password hashing (bcrypt)
- SSL/TLS for transmission
- Database encryption (PostgreSQL)
- File storage encryption (AWS S3 + KMS)
- Row-level security (RLS)
- PII protection in logs

#### E. Compliance
- GDPR-ready data handling
- Data retention policies
- User consent tracking
- Data export functionality
- Right to deletion
- Audit trails

### 🔌 API Endpoints
- `GET /security/csrf-token`
- `GET /security/metrics`
- `GET /security/health`

---

## 10. MONITORING & LOGGING

### 📁 Files & Locations
- **Logging Plugin**: `/apps/api/src/plugins/logging.plugin.ts`
- **Monitoring Plugin**: `/apps/api/src/plugins/monitoring.plugin.ts`

### 🎯 Logging Features
- Structured JSON logging
- Correlation IDs for request tracking
- Log levels (DEBUG, INFO, WARN, ERROR, CRITICAL)
- PII protection
- Request/response logging
- Error classification
- Performance metrics
- Audit trails
- Security event logging

### 📊 Monitoring Features

#### A. Application Metrics
- Request count/rate
- Response time distribution (P50, P95, P99)
- Error rate tracking
- Throughput metrics
- User activity metrics

#### B. System Metrics
- CPU usage
- Memory usage
- Disk usage
- Network metrics
- Process health monitoring

#### C. Business Metrics
- User registrations
- Job applications
- Security events
- Feature usage
- Conversion rates

#### D. Distributed Tracing
- Span tracking
- Cross-service tracing
- Error propagation tracking
- Performance bottleneck identification

#### E. Alerting System
- Configurable thresholds
- Severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- Webhook integration
- Alert aggregation

### 🔌 API Endpoints
- `GET /metrics` - Application metrics
- `GET /health` - Basic health
- `GET /health/detailed` - Detailed health
- `GET /health/security` - Security status
- `GET /health/monitoring` - Monitoring status
- `GET /traces` - Distributed traces

---

## 11. DATABASE & DATA MODELS

### 📁 Files & Locations
- **Schema**: `/packages/database/prisma/schema.prisma` (1480+ lines)
- **Plugin**: `/apps/api/src/plugins/database.plugin.ts`
- **Utils**: `/packages/database/src/utils/`

### 📊 Database Statistics
- **50+ Models** across 30+ tables
- **22 Enums** for type safety
- **PostgreSQL 16** with Prisma ORM
- **Full referential integrity**

### 🗂️ Model Categories

#### A. User Management (5 models)
- User
- UserProfile
- UserPreferences
- Account
- Session

#### B. Job System (4 models)
- JobPosting
- JobSnapshot
- UserJobSwipe
- SavedJob

#### C. Application System (4 models)
- JobApplication
- ApplicationQueue
- ApplicationInteraction
- AutomationLog

#### D. Resume System (3 models)
- Resume
- ResumeTemplate
- ResumeEnhancement

#### E. Company System (2 models)
- Company
- CompanyReview

#### F. Subscription System (3 models)
- Subscription
- BillingHistory
- UsageRecord

#### G. System & Analytics (6 models)
- AuditLog
- AnalyticsEvent
- UserNotification
- NotificationTemplate
- SystemSetting
- AutomationProxy

### 📋 Key Enums (22 total)
- UserRole, UserStatus, ProfileVisibility
- JobType, JobLevel, JobCategory, JobStatus
- ApplicationStatus, ApplicationPriority, ApplicationSource
- AutomationStatus, ExecutionMode
- QueueStatus, QueuePriority
- SubscriptionPlan, SubscriptionStatus, PaymentStatus
- NotificationType, NotificationPriority
- AuditLogAction, AnalyticsEventType

---

## 12. API ENDPOINTS

### 📁 Files & Locations
- **Routes Directory**: `/apps/api/src/routes/`

### 🔌 Complete Endpoint List (50+)

#### Authentication (8 endpoints)
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`
- POST `/auth/reset-password`
- POST `/auth/change-password`
- POST `/auth/verify-email`
- GET `/auth/me`

#### Jobs (6 endpoints)
- GET `/jobs`
- GET `/jobs/:id`
- POST `/jobs/:id/swipe`
- POST `/jobs/:id/save`
- DELETE `/jobs/:id/save`
- GET `/jobs/saved`

#### Queue (5 endpoints)
- POST `/queue/applications`
- GET `/queue/status`
- GET `/queue/jobs`
- PATCH `/queue/:id`
- DELETE `/queue/:id`

#### Applications (5 endpoints)
- GET `/applications`
- GET `/applications/:id`
- POST `/applications/:id/interactions`
- PATCH `/applications/:id`
- GET `/applications/:id/interviews`

#### Desktop (4 endpoints)
- POST `/desktop/claim`
- POST `/desktop/report`
- GET `/desktop/queue`
- POST `/desktop/heartbeat`

#### Automation (4 endpoints)
- POST `/automation/trigger`
- GET `/automation/status`
- POST `/automation/captcha`
- GET `/automation/logs`

#### Resumes (7 endpoints)
- GET `/resumes`
- POST `/resumes`
- GET `/resumes/:id`
- PUT `/resumes/:id`
- DELETE `/resumes/:id`
- POST `/resumes/:id/enhance`
- POST `/resumes/:id/download`

#### Token Exchange (1 endpoint)
- POST `/token-exchange`

#### Onboarding (3 endpoints)
- GET `/onboarding/status`
- POST `/onboarding/complete-step`
- POST `/onboarding/complete`

#### Monitoring & Health (5 endpoints)
- GET `/health`
- GET `/health/detailed`
- GET `/health/security`
- GET `/metrics`
- GET `/traces`

---

## 13. FRONTEND COMPONENTS

### 📁 Files & Locations
- **Components**: `/apps/web/src/components/`
- **Total**: 49 React components

### 🎨 Component Categories

#### A. Authentication (5 components)
- SignInForm
- SignUpForm
- PasswordResetForm
- EmailVerificationForm
- OAuthProviders

#### B. Dashboard (5 components)
- DashboardLayout
- ApplicationStats
- QuickActions
- RecentApplications
- QueueStatus

#### C. Jobs (5 components)
- JobCard
- JobGrid
- JobList
- JobDetails
- JobFilters
- JobSearchBar

#### D. Applications (5 components)
- ApplicationList
- ApplicationCard
- ApplicationTimeline
- ApplicationStatus
- InteractionLog
- InterviewSchedule

#### E. Resume (5 components)
- ResumeEditor
- ResumeTemplateGallery
- ResumePreview
- ResumeDownload
- ResumeTailor

#### F. Profile (4 components)
- ProfileForm
- ProfileAvatar
- PreferencesForm
- SettingsPanel

#### G. Onboarding (3 components)
- OnboardingFlow
- ProfileSetup
- PreferencesSetup
- ResumeSetup

#### H. UI Components (shadcn/ui)
- Button, Input, Select, TextArea
- Card, Dialog, Modal, Dropdown
- Table, Tabs, Toast, Alert
- Badge, Avatar, Loading
- Form components

---

## 14. DESKTOP APPLICATION

### 📁 Files & Locations
- **Main**: `/apps/desktop/src/main.ts`
- **Renderer**: `/apps/desktop/renderer/`
- **Companies**: `/apps/desktop/companies/`
- **Preload**: `/apps/desktop/src/preload/preload.ts`

### 🎯 Features
- Electron application
- Browser automation (Playwright + browser-use)
- Python integration (IPC)
- Queue job claiming
- Headless/headful modes
- Captcha detection
- Form analysis
- Result reporting
- Proxy rotation
- Session management
- Window state persistence

### 🏢 Company Automations
- Base automation (`companies/base/`)
- LinkedIn automation (`companies/linkedin/`)
- Greenhouse automation (`companies/greenhouse/`)

### 🔧 Core Components
- Main process (window management)
- Renderer process (Next.js UI)
- Preload script (security bridge)
- IPC handlers (communication)
- Automation services
- Python bridge

---

## 15. SHARED SERVICES & UTILITIES

### 📁 Files & Locations
- **Shared Package**: `/packages/shared/src/`
- **Types**: `/packages/types/src/`
- **Utils**: `/packages/utils/src/`
- **Config**: `/packages/config/src/`

### 🛠️ Shared Services

#### A. Authentication Services
- FrontendAuthService
- ServerJwtTokenService
- RedisSessionService
- TokenExchangeService
- SecurityMiddlewareService

#### B. Utilities
- Password utilities (hash, verify)
- String utilities
- Date/time utilities
- Validation utilities
- Error handling
- Security utilities

#### C. Constants
- APP_NAME, APP_VERSION
- JWT_CONFIG (expiry times)
- RATE_LIMITS
- HTTP_STATUS codes
- PAGINATION defaults
- FILE_SIZE_LIMITS
- NOTIFICATION_TYPES
- Error messages
- Success messages
- Feature flags

#### D. Type Definitions
- DeepPartial, DeepRequired
- Optional, RequiredFields
- Brand (branded types)
- Strict (no extra properties)
- AsyncReturnType
- Mutable, Immutable
- Flatten

---

## 16. SUBSCRIPTION & BILLING

### 📁 Files & Locations
- **Database**: Subscription models
- **Database Utils**: `/packages/database/src/utils/subscriptions.ts`

### 🎯 Features
- Subscription plans (Free, Basic, Pro, Premium, Enterprise)
- Billing history tracking
- Usage tracking
- Stripe integration (implied)
- Payment processing
- Invoice generation
- Subscription upgrades/downgrades
- Trial periods
- Cancellation handling

### 📊 Database Models
- Subscription
- BillingHistory
- UsageRecord

### 📋 Subscription Plans
- FREE
- BASIC
- PRO
- PREMIUM
- ENTERPRISE

---

## 17. NOTIFICATIONS

### 📁 Files & Locations
- **Database Models**: UserNotification, NotificationTemplate

### 🎯 Features
- User notifications
- Notification templates
- Email notifications
- In-app notifications
- Push notifications (future)
- Notification preferences
- Notification priority
- Read/unread tracking

### 📊 Database Models
- UserNotification
- NotificationTemplate

### 📋 Notification Types
- Application status updates
- Interview reminders
- Queue status
- Security alerts
- System announcements

---

## 18. ANALYTICS & REPORTING

### 📁 Files & Locations
- **Database Models**: AnalyticsEvent, AuditLog

### 🎯 Features
- Event tracking
- User activity analytics
- Application success rates
- Job swipe analytics
- Automation performance
- Audit trails
- Compliance reporting
- Performance metrics

### 📊 Database Models
- AnalyticsEvent
- AuditLog

### 📊 Analytics Types
- User behavior
- Feature usage
- Conversion rates
- Error rates
- Performance metrics

---

## 19. COMPANY INTEGRATION

### 📁 Files & Locations
- **Database**: Company, CompanyReview
- **Desktop**: `/apps/desktop/companies/`

### 🎯 Features
- Company database
- Company reviews
- Company ratings
- Company verification
- Company-specific automation
- ATS integration (Greenhouse, Lever, Workday)

### 🏢 Supported Companies
1. LinkedIn
2. Indeed
3. Glassdoor
4. Monster
5. ZipRecruiter
6. Greenhouse (ATS)
7. Lever (ATS)
8. Workday (ATS)
9. Generic (URL patterns)

### 📊 Database Models
- Company
- CompanyReview

---

## 20. DEVELOPER TOOLS

### 📁 Files & Locations
- **Scripts**: `/scripts/`
- **Configs**: Root config files

### 🛠️ Development Features
- Monorepo (Turbo + pnpm)
- TypeScript configuration
- ESLint configuration
- Prettier formatting
- Git hooks (Husky)
- Lint-staged
- Database migrations (Prisma)
- Database seeding
- Testing framework
- CI/CD pipeline

### 📦 Build Tools
- TypeScript compiler
- electron-builder
- Next.js build
- Fastify build
- Prisma generate

### 🧪 Testing
- Unit tests
- Integration tests
- E2E tests
- Service tests

---

## 📊 QUICK REFERENCE STATISTICS

| Category | Count |
|----------|-------|
| **Total Packages** | 6 |
| **Total Apps** | 3 |
| **Database Models** | 50+ |
| **Database Enums** | 22 |
| **API Endpoints** | 50+ |
| **Plugins** | 9 |
| **Services** | 10+ |
| **Web Components** | 49 |
| **Route Files** | 10 |
| **Companies Supported** | 9+ |

---

## 🔗 CRITICAL FILE QUICK ACCESS

### Must-Read Files for New Developers
1. `/home/user/jobswipe/CLAUDE.md` - Project instructions
2. `/home/user/jobswipe/ARCHITECTURAL_ANALYSIS_SUMMARY.md` - Quick overview
3. `/home/user/jobswipe/ARCHITECTURAL_ANALYSIS_DEEP_DIVE.md` - Complete analysis
4. `/packages/database/prisma/schema.prisma` - Database schema
5. `/apps/api/src/index.ts` - API server entry point

### Core API Files
- `/apps/api/src/routes/` - All API endpoints
- `/apps/api/src/plugins/` - Plugin system
- `/apps/api/src/services/` - Business logic

### Core Web Files
- `/apps/web/src/app/layout.tsx` - Root layout
- `/apps/web/src/components/` - All React components
- `/apps/web/src/lib/api/` - API clients

### Core Desktop Files
- `/apps/desktop/src/main.ts` - Electron main
- `/apps/desktop/companies/` - Automation scripts

---

## 🎯 FEATURE DEVELOPMENT GUIDELINES

### Adding New Features

1. **Authentication Feature**
   - Add to: `/apps/api/src/routes/auth.routes.ts`
   - Service: `/apps/api/src/services/AuthService.ts`
   - DB: Add to User-related models

2. **Job Feature**
   - Add to: `/apps/api/src/routes/jobs.routes.ts`
   - Service: `/apps/api/src/services/JobService.ts`
   - Component: `/apps/web/src/components/jobs/`

3. **Automation Feature**
   - Add to: `/apps/desktop/companies/`
   - Service: `/apps/api/src/services/AutomationService.ts`

4. **Database Change**
   - Modify: `/packages/database/prisma/schema.prisma`
   - Run: `npm run db:migrate`

5. **New API Endpoint**
   - Add route in `/apps/api/src/routes/`
   - Add service in `/apps/api/src/services/`
   - Add validation schema (Zod)

---

## 🔐 SECURITY CHECKLIST

When developing new features, ensure:
- [ ] Input validation (Zod schemas)
- [ ] Output sanitization
- [ ] JWT token validation
- [ ] Rate limiting applied
- [ ] CSRF protection (if state-changing)
- [ ] Audit logging
- [ ] Error handling
- [ ] PII protection
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 📚 RELATED DOCUMENTATION

- **Architecture Summary**: `ARCHITECTURAL_ANALYSIS_SUMMARY.md`
- **Deep Dive Analysis**: `ARCHITECTURAL_ANALYSIS_DEEP_DIVE.md`
- **Project Instructions**: `CLAUDE.md`
- **Database Schema**: `packages/database/prisma/schema.prisma`

---

**Document Created**: November 8, 2025
**Last Updated**: November 8, 2025
**Maintained By**: Development Team
