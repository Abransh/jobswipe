-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PREMIUM_USER', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION', 'DELETED');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'CONNECTIONS_ONLY', 'RECRUITERS_ONLY');

-- CreateEnum
CREATE TYPE "RemotePreference" AS ENUM ('REMOTE_ONLY', 'HYBRID', 'ONSITE_ONLY', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY', 'VOLUNTEER', 'APPRENTICESHIP');

-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL', 'STAFF', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'SENIOR_DIRECTOR', 'VP', 'SVP', 'C_LEVEL', 'FOUNDER');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('TECHNOLOGY', 'ENGINEERING', 'DESIGN', 'PRODUCT', 'MARKETING', 'SALES', 'FINANCE', 'OPERATIONS', 'HUMAN_RESOURCES', 'LEGAL', 'CUSTOMER_SUCCESS', 'DATA_SCIENCE', 'HEALTHCARE', 'EDUCATION', 'CONSULTING', 'MANUFACTURING', 'RETAIL', 'HOSPITALITY', 'MEDIA', 'NON_PROFIT', 'GOVERNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RemoteType" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL', 'CONTRACT', 'COMMISSION');

-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('MANUAL', 'LINKEDIN', 'INDEED', 'GLASSDOOR', 'ANGELLIST', 'STACKOVERFLOW', 'DICE', 'MONSTER', 'ZIPRECRUITER', 'BUILTIN', 'FLEXJOBS', 'REMOTE_CO', 'WEWORKREMOTELY', 'COMPANY_WEBSITE', 'RECRUITER_OUTREACH', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'FILLED', 'ON_HOLD', 'CANCELLED', 'DRAFT');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ACQUIRED', 'CLOSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'QUEUED', 'APPLYING', 'APPLIED', 'APPLICATION_ERROR', 'VIEWED', 'SCREENING', 'PHONE_SCREEN', 'INTERVIEW_SCHEDULED', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'FINAL_INTERVIEW', 'TECHNICAL_ASSESSMENT', 'TAKE_HOME_PROJECT', 'REFERENCE_CHECK', 'BACKGROUND_CHECK', 'OFFER_PENDING', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'REJECTED', 'WITHDRAWN', 'GHOSTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('MANUAL', 'AUTOMATION', 'BULK_APPLY', 'REFERRAL', 'RECRUITER', 'COMPANY_OUTREACH');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('NOT_AUTOMATED', 'QUEUED', 'IN_PROGRESS', 'WAITING_CAPTCHA', 'COMPLETED', 'FAILED', 'REQUIRES_MANUAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExecutionMode" AS ENUM ('SERVER', 'DESKTOP');

-- CreateEnum
CREATE TYPE "ProxyType" AS ENUM ('RESIDENTIAL', 'DATACENTER', 'MOBILE', 'STATIC', 'ROTATING');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING', 'PAUSED', 'REQUIRES_CAPTCHA');

-- CreateEnum
CREATE TYPE "QueuePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'IMMEDIATE');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('APPLICATION_SUBMITTED', 'EMAIL_RECEIVED', 'EMAIL_SENT', 'PHONE_CALL_INCOMING', 'PHONE_CALL_OUTGOING', 'VIDEO_CALL', 'IN_PERSON_MEETING', 'LINKEDIN_MESSAGE', 'TEXT_MESSAGE', 'RECRUITER_CONTACT', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'ASSESSMENT_SENT', 'ASSESSMENT_COMPLETED', 'REFERENCE_REQUEST', 'BACKGROUND_CHECK', 'OFFER_RECEIVED', 'OFFER_NEGOTIATION', 'REJECTION_RECEIVED', 'FOLLOW_UP_SENT', 'THANK_YOU_SENT', 'WITHDRAWAL_SENT', 'STATUS_UPDATE', 'OTHER');

-- CreateEnum
CREATE TYPE "InteractionOutcome" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NO_RESPONSE', 'NEEDS_FOLLOW_UP', 'SCHEDULED_NEXT_STEP', 'OFFER_DISCUSSION', 'REJECTION', 'INTERVIEW_SCHEDULED', 'ASSESSMENT_REQUIRED', 'REFERENCES_REQUESTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('GENERAL', 'TECHNOLOGY', 'BUSINESS', 'CREATIVE', 'ACADEMIC', 'HEALTHCARE', 'ENGINEERING', 'SALES', 'MARKETING', 'FINANCE', 'LEGAL', 'EDUCATION', 'NON_PROFIT', 'EXECUTIVE', 'ENTRY_LEVEL', 'CAREER_CHANGE');

-- CreateEnum
CREATE TYPE "ResumeVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'RECRUITERS_ONLY', 'SHARED_LINK');

-- CreateEnum
CREATE TYPE "EnhancementType" AS ENUM ('KEYWORD_OPTIMIZATION', 'ATS_OPTIMIZATION', 'JOB_SPECIFIC_TAILORING', 'SKILL_HIGHLIGHTING', 'EXPERIENCE_ENHANCEMENT', 'SUMMARY_IMPROVEMENT', 'GRAMMAR_CHECK', 'FORMAT_OPTIMIZATION', 'LENGTH_OPTIMIZATION', 'IMPACT_ENHANCEMENT');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LEFT', 'RIGHT', 'SUPER_LIKE');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELLED', 'UNPAID', 'TRIALING', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'DISPUTED', 'REQUIRES_ACTION');

-- CreateEnum
CREATE TYPE "SavedJobPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "UsageFeature" AS ENUM ('JOB_SEARCH', 'JOB_VIEW', 'JOB_SWIPE', 'JOB_SAVE', 'APPLICATION_MANUAL', 'APPLICATION_AUTOMATION', 'RESUME_CREATION', 'RESUME_EDIT', 'RESUME_DOWNLOAD', 'RESUME_ENHANCEMENT', 'COVER_LETTER_GENERATION', 'TEMPLATE_USAGE', 'PROFILE_UPDATE', 'SEARCH_FILTER', 'NOTIFICATION_SENT', 'EMAIL_SENT', 'FILE_UPLOAD', 'FILE_DOWNLOAD', 'API_CALL', 'DESKTOP_APP_USAGE', 'MOBILE_APP_USAGE', 'WEB_APP_USAGE', 'ANALYTICS_EVENT', 'AUDIT_LOG_ENTRY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOB_MATCH', 'APPLICATION_UPDATE', 'INTERVIEW_REMINDER', 'DEADLINE_REMINDER', 'NEW_MESSAGE', 'SYSTEM_NOTIFICATION', 'BILLING_NOTIFICATION', 'SECURITY_ALERT', 'FEATURE_ANNOUNCEMENT', 'WEEKLY_DIGEST', 'REFERRAL_BONUS', 'ACHIEVEMENT_UNLOCKED', 'SUBSCRIPTION_EXPIRING', 'PAYMENT_FAILED', 'ACCOUNT_SUSPENDED', 'DATA_EXPORT_READY', 'PROFILE_INCOMPLETE', 'RESUME_FEEDBACK', 'JOB_RECOMMENDATION', 'COMPANY_UPDATE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH', 'SLACK', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'CLICKED', 'DISMISSED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY', 'URL', 'EMAIL', 'PASSWORD', 'ENCRYPTED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'ADMIN', 'SYSTEM', 'API_KEY', 'SERVICE_ACCOUNT', 'AUTOMATION', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "emailVerified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "dataConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "dataRetentionUntil" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingProgress" INTEGER NOT NULL DEFAULT 0,
    "onboardingStep" INTEGER NOT NULL DEFAULT 1,
    "onboardingStartedAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timezone" TEXT,
    "locale" TEXT DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "location" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "portfolio" TEXT,
    "blog" TEXT,
    "bio" TEXT,
    "headline" TEXT,
    "summary" TEXT,
    "currentTitle" TEXT,
    "currentCompany" TEXT,
    "experienceLevel" TEXT,
    "yearsOfExperience" INTEGER,
    "skills" TEXT[],
    "certifications" JSONB,
    "languages" JSONB,
    "education" JSONB,
    "desiredJobTypes" TEXT[],
    "desiredSalaryMin" INTEGER,
    "desiredSalaryMax" INTEGER,
    "preferredCurrency" TEXT,
    "willingToRelocate" BOOLEAN DEFAULT false,
    "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "automationPreferences" JSONB,
    "coverLetterTemplate" TEXT,
    "workAuthorization" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobSearchRadius" INTEGER DEFAULT 50,
    "jobTypes" TEXT[],
    "experienceLevels" TEXT[],
    "industries" TEXT[],
    "companyTypes" TEXT[],
    "remotePref" "RemotePreference" NOT NULL DEFAULT 'NO_PREFERENCE',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "newJobMatches" BOOLEAN NOT NULL DEFAULT true,
    "applicationUpdates" BOOLEAN NOT NULL DEFAULT true,
    "interviewReminders" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "promotionalEmails" BOOLEAN NOT NULL DEFAULT false,
    "autoApplyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoApplyJobTypes" TEXT[],
    "autoApplyMaxPerDay" INTEGER DEFAULT 5,
    "autoApplyRequireMatch" BOOLEAN NOT NULL DEFAULT true,
    "dataProcessingConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "thirdPartySharing" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT DEFAULT 'light',
    "language" TEXT DEFAULT 'en',
    "timezone" TEXT,
    "dateFormat" TEXT DEFAULT 'MM/DD/YYYY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_job_swipes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "deviceType" TEXT,
    "sessionId" TEXT,
    "position" INTEGER,
    "timeSpent" INTEGER,
    "matchScore" DOUBLE PRECISION,
    "matchFactors" JSONB,
    "userFeedback" TEXT,
    "isCorrectMatch" BOOLEAN,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_job_swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "applicationId" TEXT,
    "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "QueuePriority" NOT NULL DEFAULT 'NORMAL',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "useCustomResume" BOOLEAN NOT NULL DEFAULT false,
    "resumeId" TEXT,
    "coverLetter" TEXT,
    "customFields" JSONB,
    "automationConfig" JSONB,
    "requiresCaptcha" BOOLEAN NOT NULL DEFAULT false,
    "captchaSolved" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN,
    "errorMessage" TEXT,
    "errorType" TEXT,
    "responseData" JSONB,
    "desktopSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_logs" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "details" JSONB,
    "step" TEXT,
    "elementSelector" TEXT,
    "action" TEXT,
    "errorType" TEXT,
    "stackTrace" TEXT,
    "screenshot" TEXT,
    "executionTime" INTEGER,
    "memoryUsage" INTEGER,
    "browserInfo" JSONB,
    "pageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_proxies" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "proxyType" "ProxyType" NOT NULL DEFAULT 'RESIDENTIAL',
    "provider" TEXT,
    "country" TEXT,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "lastUsedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "requestsPerHour" INTEGER DEFAULT 100,
    "dailyLimit" INTEGER DEFAULT 1000,
    "currentHourlyUsage" INTEGER NOT NULL DEFAULT 0,
    "currentDailyUsage" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "uptime" DOUBLE PRECISION,
    "costPerRequest" DECIMAL(65,30),
    "monthlyLimit" DECIMAL(65,30),
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_proxies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "actorType" "ActorType" NOT NULL DEFAULT 'USER',
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "method" TEXT,
    "endpoint" TEXT,
    "statusCode" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "riskFactors" TEXT[],
    "dataCategory" TEXT,
    "legalBasis" TEXT,
    "metadata" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "properties" JSONB,
    "traits" JSONB,
    "sessionId" TEXT,
    "deviceType" TEXT,
    "platform" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "pageUrl" TEXT,
    "revenue" DECIMAL(65,30),
    "currency" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "templateId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "SettingType" NOT NULL DEFAULT 'STRING',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "validationRule" TEXT,
    "defaultValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "subject" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "htmlBody" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "variables" JSONB,
    "conditions" JSONB,
    "category" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "industry" TEXT,
    "size" "CompanySize",
    "headquarters" TEXT,
    "locations" JSONB,
    "country" TEXT,
    "foundedYear" INTEGER,
    "employeeCount" INTEGER,
    "revenue" TEXT,
    "fundingStage" TEXT,
    "linkedinUrl" TEXT,
    "glassdoorUrl" TEXT,
    "crunchbaseUrl" TEXT,
    "twitterUrl" TEXT,
    "facebookUrl" TEXT,
    "benefits" JSONB,
    "cultureValues" TEXT[],
    "workEnvironment" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationSource" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "keywords" TEXT[],
    "tags" TEXT[],
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_reviews" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "workLifeBalance" DOUBLE PRECISION,
    "compensation" DOUBLE PRECISION,
    "culture" DOUBLE PRECISION,
    "management" DOUBLE PRECISION,
    "careerGrowth" DOUBLE PRECISION,
    "jobTitle" TEXT,
    "department" TEXT,
    "employmentType" "EmploymentType",
    "workDuration" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "benefits" TEXT,
    "type" "JobType" NOT NULL DEFAULT 'FULL_TIME',
    "level" "JobLevel" NOT NULL DEFAULT 'MID',
    "department" TEXT,
    "category" "JobCategory" NOT NULL DEFAULT 'OTHER',
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "remoteType" "RemoteType" NOT NULL DEFAULT 'ONSITE',
    "location" TEXT,
    "timeZone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "coordinates" JSONB,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "salaryType" "SalaryType",
    "equity" TEXT,
    "bonus" TEXT,
    "experienceYears" INTEGER,
    "skills" TEXT[],
    "education" TEXT,
    "languages" TEXT[],
    "companyId" TEXT NOT NULL,
    "externalId" TEXT,
    "source" "JobSource" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "applyUrl" TEXT,
    "keywords" TEXT[],
    "tags" TEXT[],
    "qualityScore" DOUBLE PRECISION,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastScrapedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "rightSwipeCount" INTEGER NOT NULL DEFAULT 0,
    "leftSwipeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_snapshots" (
    "id" TEXT NOT NULL,
    "originalJobId" TEXT NOT NULL,
    "applicationQueueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "benefits" TEXT,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "department" TEXT,
    "category" TEXT NOT NULL,
    "remote" BOOLEAN NOT NULL,
    "remoteType" TEXT NOT NULL,
    "location" TEXT,
    "timeZone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "coordinates" JSONB,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT,
    "salaryType" TEXT,
    "equity" TEXT,
    "bonus" TEXT,
    "experienceYears" INTEGER,
    "skills" TEXT[],
    "education" TEXT,
    "languages" TEXT[],
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "companyWebsite" TEXT,
    "companyIndustry" TEXT,
    "companySize" TEXT,
    "companyDescription" TEXT,
    "externalId" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "applyUrl" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "isVerified" BOOLEAN NOT NULL,
    "originalStatus" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "isFeatured" BOOLEAN NOT NULL,
    "isUrgent" BOOLEAN NOT NULL,
    "originalPostedAt" TIMESTAMP(3),
    "originalExpiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "rightSwipeCount" INTEGER NOT NULL DEFAULT 0,
    "leftSwipeCount" INTEGER NOT NULL DEFAULT 0,
    "snapshotVersion" TEXT NOT NULL DEFAULT '1.0',
    "snapshotReason" TEXT NOT NULL DEFAULT 'USER_SWIPE_RIGHT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "TemplateCategory" NOT NULL DEFAULT 'GENERAL',
    "content" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "styling" JSONB NOT NULL,
    "preview" TEXT,
    "thumbnails" JSONB,
    "industry" TEXT,
    "experience" TEXT,
    "jobTypes" TEXT[],
    "qualityScore" DOUBLE PRECISION,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "ratings" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "keywords" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "resume_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "metadata" JSONB,
    "pdfUrl" TEXT,
    "docxUrl" TEXT,
    "htmlUrl" TEXT,
    "fileSize" INTEGER,
    "pageCount" INTEGER,
    "lastGenerated" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentResumeId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "ResumeVisibility" NOT NULL DEFAULT 'PRIVATE',
    "shareToken" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "aiEnhanced" BOOLEAN NOT NULL DEFAULT false,
    "enhancementData" JSONB,
    "completeness" DOUBLE PRECISION,
    "readabilityScore" DOUBLE PRECISION,
    "keywordMatch" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_enhancements" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "templateId" TEXT,
    "jobPostingId" TEXT,
    "type" "EnhancementType" NOT NULL,
    "description" TEXT NOT NULL,
    "originalContent" JSONB NOT NULL,
    "enhancedContent" JSONB NOT NULL,
    "changes" JSONB NOT NULL,
    "aiModel" TEXT,
    "prompt" TEXT,
    "confidence" DOUBLE PRECISION,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "improvedMatch" DOUBLE PRECISION,
    "successRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_enhancements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "resumeId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ApplicationPriority" NOT NULL DEFAULT 'MEDIUM',
    "source" "ApplicationSource" NOT NULL DEFAULT 'MANUAL',
    "coverLetter" TEXT,
    "customFields" JSONB,
    "notes" TEXT,
    "customResume" JSONB,
    "resumeVersion" TEXT,
    "appliedAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "responseAt" TIMESTAMP(3),
    "interviewAt" TIMESTAMP(3),
    "followUpAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "atsUrl" TEXT,
    "confirmationNumber" TEXT,
    "automationStatus" "AutomationStatus",
    "automationAttempts" INTEGER NOT NULL DEFAULT 0,
    "automationData" JSONB,
    "lastAutomationAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "contactMethod" TEXT,
    "recruiterName" TEXT,
    "recruiterEmail" TEXT,
    "recruiterPhone" TEXT,
    "responseTime" INTEGER,
    "interviewCount" INTEGER NOT NULL DEFAULT 0,
    "matchScore" DOUBLE PRECISION,
    "appliedVia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "automationLogs" JSONB,
    "executionMode" "ExecutionMode" DEFAULT 'DESKTOP',
    "proxyUsed" TEXT,
    "serverIpAddress" TEXT,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_interactions" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "outcome" "InteractionOutcome",
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactRole" TEXT,
    "medium" TEXT,
    "location" TEXT,
    "duration" INTEGER,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rescheduledFrom" TIMESTAMP(3),
    "agenda" TEXT,
    "notes" TEXT,
    "feedback" TEXT,
    "nextSteps" TEXT,
    "attachments" JSONB,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "folder" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "priority" "SavedJobPriority" NOT NULL DEFAULT 'MEDIUM',
    "alertOnUpdate" BOOLEAN NOT NULL DEFAULT false,
    "alertOnDeadline" BOOLEAN NOT NULL DEFAULT false,
    "reminderDate" TIMESTAMP(3),
    "savedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeProductId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "trialUsed" BOOLEAN NOT NULL DEFAULT false,
    "monthlyApplications" INTEGER,
    "resumeTemplates" INTEGER,
    "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "lastPaymentAt" TIMESTAMP(3),
    "lastPaymentAmount" DECIMAL(65,30),
    "nextBillingDate" TIMESTAMP(3),
    "promoCode" TEXT,
    "discountPercent" DOUBLE PRECISION,
    "discountEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_history" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "description" TEXT,
    "invoiceUrl" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "feature" "UsageFeature" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "sessionId" TEXT,
    "deviceType" TEXT,
    "ipAddress" TEXT,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hour" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_lastLoginAt_idx" ON "users"("lastLoginAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_city_state_country_idx" ON "user_profiles"("city", "state", "country");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "user_job_swipes_userId_direction_idx" ON "user_job_swipes"("userId", "direction");

-- CreateIndex
CREATE INDEX "user_job_swipes_jobPostingId_direction_idx" ON "user_job_swipes"("jobPostingId", "direction");

-- CreateIndex
CREATE INDEX "user_job_swipes_createdAt_idx" ON "user_job_swipes"("createdAt");

-- CreateIndex
CREATE INDEX "user_job_swipes_matchScore_idx" ON "user_job_swipes"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "user_job_swipes_userId_jobPostingId_key" ON "user_job_swipes"("userId", "jobPostingId");

-- CreateIndex
CREATE INDEX "application_queue_userId_status_idx" ON "application_queue"("userId", "status");

-- CreateIndex
CREATE INDEX "application_queue_status_scheduledAt_idx" ON "application_queue"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "application_queue_priority_scheduledAt_idx" ON "application_queue"("priority", "scheduledAt");

-- CreateIndex
CREATE INDEX "application_queue_createdAt_idx" ON "application_queue"("createdAt");

-- CreateIndex
CREATE INDEX "automation_logs_queueId_level_idx" ON "automation_logs"("queueId", "level");

-- CreateIndex
CREATE INDEX "automation_logs_createdAt_idx" ON "automation_logs"("createdAt");

-- CreateIndex
CREATE INDEX "automation_logs_level_createdAt_idx" ON "automation_logs"("level", "createdAt");

-- CreateIndex
CREATE INDEX "automation_proxies_isActive_proxyType_idx" ON "automation_proxies"("isActive", "proxyType");

-- CreateIndex
CREATE INDEX "automation_proxies_provider_isActive_idx" ON "automation_proxies"("provider", "isActive");

-- CreateIndex
CREATE INDEX "automation_proxies_successRate_idx" ON "automation_proxies"("successRate");

-- CreateIndex
CREATE INDEX "automation_proxies_lastUsedAt_idx" ON "automation_proxies"("lastUsedAt");

-- CreateIndex
CREATE INDEX "automation_proxies_failureCount_idx" ON "automation_proxies"("failureCount");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_riskLevel_createdAt_idx" ON "audit_logs"("riskLevel", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_ipAddress_createdAt_idx" ON "audit_logs"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_userId_eventType_idx" ON "analytics_events"("userId", "eventType");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_timestamp_idx" ON "analytics_events"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "user_notifications_userId_status_idx" ON "user_notifications"("userId", "status");

-- CreateIndex
CREATE INDEX "user_notifications_type_createdAt_idx" ON "user_notifications"("type", "createdAt");

-- CreateIndex
CREATE INDEX "user_notifications_scheduledFor_idx" ON "user_notifications"("scheduledFor");

-- CreateIndex
CREATE INDEX "user_notifications_createdAt_idx" ON "user_notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE INDEX "system_settings_isPublic_idx" ON "system_settings"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_name_key" ON "notification_templates"("name");

-- CreateIndex
CREATE INDEX "notification_templates_type_isActive_idx" ON "notification_templates"("type", "isActive");

-- CreateIndex
CREATE INDEX "notification_templates_channel_isActive_idx" ON "notification_templates"("channel", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_slug_idx" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_industry_idx" ON "companies"("industry");

-- CreateIndex
CREATE INDEX "companies_size_idx" ON "companies"("size");

-- CreateIndex
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE INDEX "companies_isVerified_idx" ON "companies"("isVerified");

-- CreateIndex
CREATE INDEX "companies_qualityScore_idx" ON "companies"("qualityScore");

-- CreateIndex
CREATE INDEX "company_reviews_companyId_isApproved_idx" ON "company_reviews"("companyId", "isApproved");

-- CreateIndex
CREATE INDEX "company_reviews_rating_idx" ON "company_reviews"("rating");

-- CreateIndex
CREATE INDEX "company_reviews_createdAt_idx" ON "company_reviews"("createdAt");

-- CreateIndex
CREATE INDEX "job_postings_companyId_idx" ON "job_postings"("companyId");

-- CreateIndex
CREATE INDEX "job_postings_type_level_idx" ON "job_postings"("type", "level");

-- CreateIndex
CREATE INDEX "job_postings_remote_remoteType_idx" ON "job_postings"("remote", "remoteType");

-- CreateIndex
CREATE INDEX "job_postings_status_isActive_idx" ON "job_postings"("status", "isActive");

-- CreateIndex
CREATE INDEX "job_postings_source_idx" ON "job_postings"("source");

-- CreateIndex
CREATE INDEX "job_postings_city_state_country_idx" ON "job_postings"("city", "state", "country");

-- CreateIndex
CREATE INDEX "job_postings_salaryMin_salaryMax_idx" ON "job_postings"("salaryMin", "salaryMax");

-- CreateIndex
CREATE INDEX "job_postings_createdAt_idx" ON "job_postings"("createdAt");

-- CreateIndex
CREATE INDEX "job_postings_postedAt_idx" ON "job_postings"("postedAt");

-- CreateIndex
CREATE INDEX "job_postings_qualityScore_idx" ON "job_postings"("qualityScore");

-- CreateIndex
CREATE INDEX "job_postings_title_idx" ON "job_postings"("title");

-- CreateIndex
CREATE INDEX "job_postings_description_idx" ON "job_postings"("description");

-- CreateIndex
CREATE UNIQUE INDEX "job_snapshots_applicationQueueId_key" ON "job_snapshots"("applicationQueueId");

-- CreateIndex
CREATE INDEX "job_snapshots_originalJobId_idx" ON "job_snapshots"("originalJobId");

-- CreateIndex
CREATE INDEX "job_snapshots_applicationQueueId_idx" ON "job_snapshots"("applicationQueueId");

-- CreateIndex
CREATE INDEX "job_snapshots_companyName_idx" ON "job_snapshots"("companyName");

-- CreateIndex
CREATE INDEX "job_snapshots_title_idx" ON "job_snapshots"("title");

-- CreateIndex
CREATE INDEX "job_snapshots_createdAt_idx" ON "job_snapshots"("createdAt");

-- CreateIndex
CREATE INDEX "job_snapshots_originalPostedAt_idx" ON "job_snapshots"("originalPostedAt");

-- CreateIndex
CREATE INDEX "resume_templates_category_isActive_idx" ON "resume_templates"("category", "isActive");

-- CreateIndex
CREATE INDEX "resume_templates_isPremium_isActive_idx" ON "resume_templates"("isPremium", "isActive");

-- CreateIndex
CREATE INDEX "resume_templates_qualityScore_idx" ON "resume_templates"("qualityScore");

-- CreateIndex
CREATE INDEX "resume_templates_downloads_idx" ON "resume_templates"("downloads");

-- CreateIndex
CREATE INDEX "resume_templates_name_idx" ON "resume_templates"("name");

-- CreateIndex
CREATE INDEX "resume_templates_description_idx" ON "resume_templates"("description");

-- CreateIndex
CREATE INDEX "resumes_userId_isDefault_idx" ON "resumes"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "resumes_templateId_idx" ON "resumes"("templateId");

-- CreateIndex
CREATE INDEX "resumes_visibility_idx" ON "resumes"("visibility");

-- CreateIndex
CREATE INDEX "resumes_aiEnhanced_idx" ON "resumes"("aiEnhanced");

-- CreateIndex
CREATE INDEX "resumes_createdAt_idx" ON "resumes"("createdAt");

-- CreateIndex
CREATE INDEX "resume_enhancements_resumeId_type_idx" ON "resume_enhancements"("resumeId", "type");

-- CreateIndex
CREATE INDEX "resume_enhancements_jobPostingId_idx" ON "resume_enhancements"("jobPostingId");

-- CreateIndex
CREATE INDEX "resume_enhancements_isApplied_idx" ON "resume_enhancements"("isApplied");

-- CreateIndex
CREATE INDEX "resume_enhancements_createdAt_idx" ON "resume_enhancements"("createdAt");

-- CreateIndex
CREATE INDEX "job_applications_userId_status_idx" ON "job_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "job_applications_status_priority_idx" ON "job_applications"("status", "priority");

-- CreateIndex
CREATE INDEX "job_applications_appliedAt_idx" ON "job_applications"("appliedAt");

-- CreateIndex
CREATE INDEX "job_applications_source_idx" ON "job_applications"("source");

-- CreateIndex
CREATE INDEX "job_applications_automationStatus_idx" ON "job_applications"("automationStatus");

-- CreateIndex
CREATE INDEX "job_applications_createdAt_idx" ON "job_applications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_userId_jobPostingId_key" ON "job_applications"("userId", "jobPostingId");

-- CreateIndex
CREATE INDEX "application_interactions_applicationId_type_idx" ON "application_interactions"("applicationId", "type");

-- CreateIndex
CREATE INDEX "application_interactions_scheduledAt_idx" ON "application_interactions"("scheduledAt");

-- CreateIndex
CREATE INDEX "application_interactions_completedAt_idx" ON "application_interactions"("completedAt");

-- CreateIndex
CREATE INDEX "application_interactions_requiresFollowUp_idx" ON "application_interactions"("requiresFollowUp");

-- CreateIndex
CREATE INDEX "saved_jobs_userId_folder_idx" ON "saved_jobs"("userId", "folder");

-- CreateIndex
CREATE INDEX "saved_jobs_priority_idx" ON "saved_jobs"("priority");

-- CreateIndex
CREATE INDEX "saved_jobs_reminderDate_idx" ON "saved_jobs"("reminderDate");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_userId_jobPostingId_key" ON "saved_jobs"("userId", "jobPostingId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_plan_status_idx" ON "subscriptions"("plan", "status");

-- CreateIndex
CREATE INDEX "subscriptions_stripeCustomerId_idx" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "subscriptions_nextBillingDate_idx" ON "subscriptions"("nextBillingDate");

-- CreateIndex
CREATE INDEX "billing_history_subscriptionId_status_idx" ON "billing_history"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "billing_history_status_createdAt_idx" ON "billing_history"("status", "createdAt");

-- CreateIndex
CREATE INDEX "usage_records_userId_feature_idx" ON "usage_records"("userId", "feature");

-- CreateIndex
CREATE INDEX "usage_records_feature_date_idx" ON "usage_records"("feature", "date");

-- CreateIndex
CREATE INDEX "usage_records_subscriptionId_idx" ON "usage_records"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "usage_records_userId_feature_date_key" ON "usage_records"("userId", "feature", "date");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_swipes" ADD CONSTRAINT "user_job_swipes_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_swipes" ADD CONSTRAINT "user_job_swipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_queue" ADD CONSTRAINT "application_queue_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_queue" ADD CONSTRAINT "application_queue_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_queue" ADD CONSTRAINT "application_queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "application_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_snapshots" ADD CONSTRAINT "job_snapshots_applicationQueueId_fkey" FOREIGN KEY ("applicationQueueId") REFERENCES "application_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_snapshots" ADD CONSTRAINT "job_snapshots_originalJobId_fkey" FOREIGN KEY ("originalJobId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "resume_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_enhancements" ADD CONSTRAINT "resume_enhancements_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_enhancements" ADD CONSTRAINT "resume_enhancements_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_enhancements" ADD CONSTRAINT "resume_enhancements_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "resume_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_interactions" ADD CONSTRAINT "application_interactions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
