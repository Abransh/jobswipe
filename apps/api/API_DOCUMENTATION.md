# JobSwipe API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URLs & Environment](#base-urls--environment)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Authentication & Authorization](#authentication--authorization)
  - [Job Management](#job-management)
  - [Job Application Queue](#job-application-queue)
  - [Automation System](#automation-system)
  - [Token Exchange (Desktop)](#token-exchange-desktop)
  - [Health & Monitoring](#health--monitoring)
  - [Security](#security)
- [WebSocket Events](#websocket-events)
- [SDK Examples](#sdk-examples)
- [Environment Variables](#environment-variables)

## Overview

The JobSwipe API is an enterprise-grade RESTful API that powers the JobSwipe platform - a job application automation system that combines web/mobile interfaces with AI-powered desktop automation.

### Key Features
- **Multi-platform Authentication**: Web, desktop, and mobile app support
- **Job Application Automation**: AI-powered browser automation using browser-use library
- **Queue Management**: BullMQ-powered job application processing
- **Real-time Updates**: WebSocket integration for live status updates
- **Enterprise Security**: JWT tokens, CSRF protection, rate limiting, attack detection
- **Comprehensive Monitoring**: Metrics, health checks, and observability

### Technology Stack
- **Framework**: Fastify 4.x with TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Queue**: BullMQ + Redis
- **Automation**: browser-use library with Playwright
- **Validation**: Zod schemas

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with refresh token rotation.

### Token Types
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (30 days), used to obtain new access tokens
- **Desktop Token**: Extended lifetime (90 days), used for desktop app authentication

### Authentication Flow
1. Login with email/password to receive access and refresh tokens
2. Include access token in `Authorization: Bearer <token>` header
3. When access token expires, use refresh token to get new tokens
4. Desktop apps use secure token exchange flow

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-CSRF-Token: <csrf_token> // Required for POST/PUT/DELETE requests
```

## Base URLs & Environment

### Development
```
Base URL: http://localhost:3001/api/v1
WebSocket: ws://localhost:3001
```

### Production
```
Base URL: https://api.jobswipe.com/api/v1
WebSocket: wss://api.jobswipe.com
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 login attempts per 15 minutes per IP
- **Token Exchange**: 5 attempts per hour per user
- **Server Automation**: Limited by user plan (Free: 5/month, Pro: 100/month)

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 900
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "errorCode": "ERROR_CODE",
  "details": {
    "field": "specific error details"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "correlationId": "uuid-for-tracking"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## API Endpoints

## Authentication & Authorization

### Register User
```http
POST /auth/register
```

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "source": "web",
  "termsAccepted": true,
  "privacyAccepted": true,
  "marketingConsent": false,
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "emailVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000
  },
  "session": {
    "id": "session_uuid",
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

### Login User
```http
POST /auth/login
```

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "source": "web",
  "rememberMe": false,
  "deviceId": "device_uuid",
  "deviceName": "Chrome Browser"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "emailVerified": true,
    "lastLoginAt": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

### Refresh Token
```http
POST /auth/refresh
POST /auth/token/refresh
```

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token",
  "source": "web"
}
```

**Response (200):**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000
  }
}
```

### Get Current User
```http
GET /auth/profile
GET /auth/me
```

Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "timezone": "America/New_York"
    }
  }
}
```

### Logout
```http
POST /auth/logout
```

Logout user and invalidate tokens.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Change Password
```http
POST /auth/password/change
```

Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

### Request Password Reset
```http
POST /auth/password/reset
```

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "source": "web"
}
```

### Check Email Availability
```http
POST /auth/check-email
```

Check if email is available for registration.

**Request Body:**
```json
{
  "email": "newuser@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "available": true
}
```

## Job Management

### Get Jobs
```http
GET /jobs
```

Fetch jobs with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20, max: 100)
- `sortBy` (string): Sort criteria (relevance, date, salary)
- `q` (string): Search query
- `location` (string): Location filter
- `remote` (string): Remote work filter (remote_only, onsite, any)
- `jobType` (string): Job types (comma-separated)
- `jobLevel` (string): Job levels (comma-separated)
- `salaryMin` (number): Minimum salary
- `salaryMax` (number): Maximum salary
- `skills` (string): Required skills (comma-separated)
- `companySize` (string): Company sizes (comma-separated)
- `userLat` (number): User latitude for location relevance
- `userLng` (number): User longitude for location relevance

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_uuid",
        "title": "Senior Software Engineer",
        "description": "Job description...",
        "company": {
          "id": "company_uuid",
          "name": "TechCorp Inc",
          "logo": "https://example.com/logo.png",
          "website": "https://techcorp.com"
        },
        "location": "San Francisco, CA",
        "remote": true,
        "salary": {
          "min": 120000,
          "max": 180000,
          "currency": "USD",
          "type": "annual"
        },
        "type": "FULL_TIME",
        "level": "SENIOR_LEVEL",
        "postedAt": "2024-01-15T10:30:00Z",
        "applyUrl": "https://company.com/apply",
        "skills": ["JavaScript", "React", "Node.js"]
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "hasMore": true
    },
    "filters": {
      "location": "San Francisco",
      "remote": "any"
    }
  }
}
```

### Get Job Details
```http
GET /jobs/{id}
```

Get detailed information about a specific job.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "job_uuid",
    "title": "Senior Software Engineer",
    "description": "Detailed job description...",
    "requirements": ["5+ years experience", "React expertise"],
    "benefits": ["Health insurance", "401k matching"],
    "company": {
      "id": "company_uuid",
      "name": "TechCorp Inc",
      "description": "Leading technology company...",
      "size": "LARGE",
      "industry": "Technology"
    },
    "location": "San Francisco, CA",
    "remote": true,
    "salary": {
      "min": 120000,
      "max": 180000,
      "currency": "USD"
    },
    "postedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

### Job Recommendations (Swiping)
```http
GET /jobs/recommendations
```

Get personalized job recommendations for swiping interface.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (number): Number of jobs (default: 20, max: 50)
- `offset` (number): Offset for pagination
- `location` (string): Location filter
- `remote` (boolean): Remote work preference
- `salaryMin` (number): Minimum salary requirement
- `jobType` (string): Job type preference
- `skills` (string): Comma-separated skills

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_uuid",
        "title": "Frontend Developer",
        "company": {
          "name": "StartupXYZ",
          "logo": "https://example.com/logo.png"
        },
        "location": "Remote",
        "salary": {
          "min": 80000,
          "max": 120000,
          "currency": "USD"
        },
        "swipeMetadata": {
          "hasBeenSwiped": false,
          "matchScore": 85,
          "recommendationReason": "High Quality Match"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "hasMore": true
    },
    "statistics": {
      "totalAvailable": 45,
      "excludedBySwipes": 12,
      "filtersApplied": 3
    }
  }
}
```

### Swipe on Job
```http
POST /jobs/{id}/swipe
```

Handle job swiping (left/right) with automation integration.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "direction": "RIGHT",
  "resumeId": "resume_uuid",
  "coverLetter": "I am excited to apply for this position...",
  "priority": 5,
  "customFields": {
    "portfolio": "https://myportfolio.com"
  },
  "metadata": {
    "source": "web",
    "deviceId": "device_uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response for RIGHT swipe (201):**
```json
{
  "success": true,
  "message": "Right swipe queued for desktop processing",
  "data": {
    "jobId": "job_uuid",
    "direction": "RIGHT",
    "action": "queued_for_desktop",
    "executionMode": "desktop",
    "applicationId": "app_uuid",
    "serverAutomation": {
      "eligible": false,
      "reason": "Server automation limit reached",
      "remainingServerApplications": 0,
      "upgradeRequired": true,
      "suggestedAction": "Download desktop app for unlimited applications"
    }
  },
  "correlationId": "request_uuid"
}
```

### Advanced Job Search
```http
POST /jobs/advanced-search
```

Perform advanced job search with complex filtering.

**Request Body:**
```json
{
  "query": "React developer",
  "skills": ["React", "TypeScript", "GraphQL"],
  "location": "San Francisco",
  "salaryMin": 100000,
  "salaryMax": 200000,
  "experienceMin": 3,
  "experienceMax": 8,
  "remote": "preferred",
  "companySize": "startup",
  "posted": "last_week",
  "page": 1,
  "limit": 20
}
```

## Job Application Queue

### Queue Job Application
```http
POST /queue/apply
```

Queue a job application for processing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "jobId": "job_uuid",
  "resumeId": "resume_uuid",
  "coverLetter": "Personalized cover letter...",
  "priority": 7,
  "customFields": {
    "portfolio": "https://portfolio.com",
    "linkedin": "https://linkedin.com/in/username"
  },
  "metadata": {
    "source": "web",
    "deviceId": "device_uuid",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_uuid",
    "snapshotId": "snapshot_uuid",
    "status": "PENDING",
    "priority": "HIGH",
    "executionMode": "desktop",
    "serverAutomation": {
      "eligible": false,
      "reason": "Free plan limit reached",
      "remainingServerApplications": 0,
      "upgradeRequired": true,
      "suggestedAction": "Upgrade to Pro plan for server automation"
    }
  },
  "message": "Job application queued for desktop processing",
  "correlationId": "request_uuid"
}
```

### Get Applications
```http
GET /queue/applications
```

Get user's job applications with pagination and filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (number): Results per page (default: 50, max: 100)
- `offset` (number): Pagination offset
- `status` (string): Filter by status (pending, queued, processing, completed, failed, cancelled)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_uuid",
        "jobId": "job_uuid",
        "status": "completed",
        "priority": "normal",
        "attempts": 1,
        "maxAttempts": 3,
        "scheduledAt": "2024-01-15T10:30:00Z",
        "startedAt": "2024-01-15T10:35:00Z",
        "completedAt": "2024-01-15T10:40:00Z",
        "success": true,
        "job": {
          "title": "Senior Developer",
          "company": "TechCorp",
          "location": "San Francisco, CA",
          "salary": {
            "min": 120000,
            "max": 180000,
            "currency": "USD"
          }
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Application Details
```http
GET /queue/applications/{id}
```

Get detailed information about a specific application.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "app_uuid",
    "jobId": "job_uuid",
    "status": "completed",
    "priority": "high",
    "attempts": 1,
    "success": true,
    "errorMessage": null,
    "responseData": {
      "confirmationNumber": "APP-12345",
      "applicationUrl": "https://company.com/application/12345"
    },
    "automationStatus": {
      "executionId": "exec_uuid",
      "steps": [
        {
          "name": "Navigate to job page",
          "status": "completed",
          "duration": 2.5
        },
        {
          "name": "Fill application form",
          "status": "completed",
          "duration": 15.2
        },
        {
          "name": "Submit application",
          "status": "completed",
          "duration": 1.8
        }
      ]
    },
    "job": {
      "title": "Senior Developer",
      "company": "TechCorp",
      "description": "Job description...",
      "applyUrl": "https://company.com/jobs/123"
    },
    "logs": [
      {
        "id": "log_uuid",
        "level": "info",
        "message": "Application submitted successfully",
        "step": "submit",
        "createdAt": "2024-01-15T10:40:00Z"
      }
    ]
  }
}
```

### Application Actions
```http
POST /queue/applications/{id}/action
```

Perform actions on applications (cancel, retry, prioritize).

**Request Body:**
```json
{
  "action": "retry",
  "reason": "Network timeout during submission"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "app_uuid",
    "status": "pending",
    "priority": "normal",
    "message": "Application retry successful"
  }
}
```

### Get Queue Position
```http
GET /queue/applications/{id}/position
```

Get current queue position and estimated processing time.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "position": 5,
    "estimatedTime": "~15 minutes",
    "isPriority": false,
    "status": "queued",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Update Progress (Desktop App)
```http
POST /queue/applications/{id}/progress
```

Update application progress from desktop automation (used by desktop app).

**Request Body:**
```json
{
  "applicationId": "app_uuid",
  "progress": {
    "step": "Filling application form",
    "percentage": 65,
    "message": "Entering personal information",
    "timestamp": "2024-01-15T10:35:00Z"
  },
  "status": "processing",
  "executionId": "exec_uuid"
}
```

### Get Queue Statistics
```http
GET /queue/stats
```

Get queue statistics for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "totalApplications": 25,
      "statusBreakdown": {
        "pending": 2,
        "queued": 1,
        "processing": 1,
        "completed": 18,
        "failed": 3,
        "cancelled": 0
      },
      "recentApplications": [
        {
          "id": "app_uuid",
          "title": "Senior Developer",
          "company": "TechCorp",
          "status": "completed",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    },
    "automation": {
      "queueHealth": "healthy",
      "averageProcessingTime": 8.5,
      "successRate": 0.89
    }
  }
}
```

## Automation System

### Trigger Automation
```http
POST /automation/trigger
```

Trigger job application automation from web interface.

**Request Body:**
```json
{
  "applicationId": "app_uuid",
  "userId": "user_uuid",
  "jobId": "job_uuid",
  "jobData": {
    "id": "job_uuid",
    "title": "Senior Developer",
    "company": "TechCorp",
    "applyUrl": "https://company.com/apply",
    "location": "San Francisco, CA",
    "description": "Job description..."
  },
  "userProfile": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "resumeUrl": "https://storage.com/resume.pdf",
    "currentTitle": "Software Engineer",
    "yearsExperience": 5,
    "skills": ["React", "Node.js"],
    "location": "San Francisco, CA",
    "workAuthorization": "US Citizen",
    "linkedinUrl": "https://linkedin.com/in/johndoe"
  },
  "executionMode": "server",
  "priority": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "automationId": "automation_uuid",
  "status": "queued",
  "executionMode": "server",
  "message": "Automation queued for server execution"
}
```

### Get Automation Status
```http
GET /automation/status/{applicationId}
```

Get status of job application automation.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_uuid",
    "status": "COMPLETED",
    "progress": 100,
    "result": {
      "success": true,
      "confirmationNumber": "APP-12345",
      "executionTime": 45.2,
      "companyAutomation": "linkedin",
      "steps": [
        {
          "stepName": "navigate_to_job",
          "action": "Navigate to job posting",
          "success": true,
          "timestamp": "2024-01-15T10:30:00Z",
          "durationMs": 2500
        },
        {
          "stepName": "fill_application",
          "action": "Fill application form",
          "success": true,
          "timestamp": "2024-01-15T10:32:00Z",
          "durationMs": 35200
        },
        {
          "stepName": "submit_application",
          "action": "Submit application",
          "success": true,
          "timestamp": "2024-01-15T10:35:00Z",
          "durationMs": 1800
        }
      ],
      "screenshots": [
        "https://storage.com/screenshot1.png",
        "https://storage.com/screenshot2.png"
      ],
      "captchaEvents": []
    }
  }
}
```

### Get Automation Limits
```http
GET /automation/limits
```

Get user automation limits and server eligibility.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "canUseServerAutomation": false,
    "remainingServerApplications": 0,
    "serverApplicationsUsed": 5,
    "serverApplicationsLimit": 5,
    "plan": "free",
    "upgradeRequired": true,
    "suggestedAction": "Upgrade to Pro plan for unlimited server automation"
  }
}
```

### Get Automation Queue
```http
GET /automation/queue
```

Get automation queue statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pending": 12,
    "processing": 3,
    "completed": 145,
    "failed": 8,
    "averageProcessingTime": 42.5,
    "supportedCompanies": [
      "linkedin",
      "indeed",
      "glassdoor",
      "greenhouse",
      "lever",
      "workday"
    ]
  }
}
```

### Get Automation History
```http
GET /automation/history
```

Get user's automation history.

**Query Parameters:**
- `limit` (number): Results per page (default: 50)
- `offset` (number): Pagination offset
- `status` (string): Filter by status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "app_uuid",
        "jobId": "job_uuid",
        "jobTitle": "Senior Developer",
        "company": "TechCorp",
        "status": "completed",
        "appliedAt": "2024-01-15T10:30:00Z",
        "confirmationNumber": "APP-12345"
      }
    ],
    "total": 25,
    "hasMore": false
  }
}
```

### Cancel Automation
```http
DELETE /automation/{applicationId}
```

Cancel a queued or running automation.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cancelled": true,
    "refunded": false
  }
}
```

### Get Supported Companies
```http
GET /automation/companies
```

Get list of supported companies for automation.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "companies": {
      "linkedin": ["linkedin.com/jobs", "linkedin.com/in/"],
      "indeed": ["indeed.com"],
      "glassdoor": ["glassdoor.com"],
      "greenhouse": ["greenhouse.io"],
      "lever": ["lever.co"],
      "workday": ["myworkdayjobs.com"]
    },
    "totalSupported": 6
  }
}
```

### Automation Health
```http
GET /automation/health
```

Get automation system health status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "activeProcesses": 3,
    "queueHealth": {
      "pending": 12,
      "processing": 3,
      "failed": 2
    },
    "systemInfo": {
      "uptime": 86400,
      "memoryUsage": 65.4,
      "supportedCompanies": ["linkedin", "indeed", "glassdoor"]
    },
    "issues": []
  }
}
```

## Token Exchange (Desktop)

### Initiate Token Exchange
```http
POST /token-exchange/initiate
```

Initiate secure token exchange for desktop app authentication.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deviceId": "device_uuid",
  "deviceName": "John's MacBook Pro",
  "deviceType": "desktop",
  "platform": "darwin",
  "osVersion": "macOS 14.0",
  "appVersion": "1.2.0"
}
```

**Response (200):**
```json
{
  "success": true,
  "exchangeToken": "exch_1640995200_abc123def456...",
  "expiresAt": "2024-01-15T10:40:00Z",
  "deviceId": "device_uuid",
  "instructions": {
    "step1": "Open the JobSwipe desktop application",
    "step2": "The app will automatically detect this authentication request",
    "step3": "Confirm the device details match your desktop application",
    "warning": "Only complete this process on your trusted device"
  }
}
```

### Complete Token Exchange
```http
POST /token-exchange/complete
```

Complete token exchange from desktop app.

**Request Body:**
```json
{
  "exchangeToken": "exch_1640995200_abc123def456...",
  "deviceId": "device_uuid",
  "deviceName": "John's MacBook Pro",
  "platform": "darwin",
  "systemInfo": {
    "platform": "darwin",
    "version": "14.0.0",
    "arch": "x64"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "desktop_jwt_token",
  "tokenType": "Bearer",
  "expiresIn": 7776000,
  "tokenId": "token_uuid",
  "deviceId": "device_uuid",
  "issuedAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-04-15T10:30:00Z",
  "permissions": ["automation", "queue", "profile"],
  "features": ["unlimited_applications", "priority_queue"]
}
```

### Verify Token Exchange
```http
GET /token-exchange/verify/{token}
```

Verify token exchange status.

**Response (200):**
```json
{
  "valid": true,
  "deviceInfo": {
    "deviceId": "device_uuid",
    "deviceName": "John's MacBook Pro",
    "platform": "darwin"
  },
  "expiresAt": "2024-01-15T10:40:00Z"
}
```

### Cancel Token Exchange
```http
DELETE /token-exchange/{token}
```

Cancel an active token exchange.

**Response (200):**
```json
{
  "success": true,
  "message": "Token exchange cancelled"
}
```

## Health & Monitoring

### Basic Health Check
```http
GET /health
```

Basic application health status.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### Detailed Health Check
```http
GET /health/detailed
```

Comprehensive health status with all services.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "connections": {
        "active": 5,
        "idle": 15,
        "total": 20
      }
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2,
      "memory": {
        "used": "45MB",
        "peak": "78MB"
      }
    },
    "queue": {
      "status": "healthy",
      "jobs": {
        "waiting": 12,
        "active": 3,
        "completed": 145,
        "failed": 2
      }
    },
    "automation": {
      "status": "healthy",
      "activeProcesses": 3,
      "supportedCompanies": 6
    }
  },
  "metrics": {
    "uptime": 86400,
    "memory": {
      "usage": 256,
      "limit": 512
    },
    "cpu": {
      "usage": 15.6
    }
  }
}
```

### Application Metrics
```http
GET /metrics
```

Get application and system metrics.

**Query Parameters:**
- `timeRange` (number): Time range in milliseconds (default: 3600000 = 1 hour)

**Response (200):**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "requests": {
      "total": 1247,
      "successful": 1189,
      "failed": 58,
      "averageResponseTime": 145.6,
      "requestRate": 20.8
    },
    "system": {
      "cpu": 15.6,
      "memory": 68.4,
      "uptime": 86400,
      "connections": 45
    },
    "business": {
      "users": {
        "active": 127,
        "registered": 1456
      },
      "applications": {
        "completed": 89,
        "failed": 12
      }
    },
    "alerts": {
      "total": 0,
      "critical": 0,
      "high": 0,
      "recent": []
    }
  },
  "detailed": {
    "requests": [],
    "system": [],
    "business": [],
    "traces": []
  }
}
```

### Monitoring Health
```http
GET /health/monitoring
```

Get monitoring system health status.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "monitoring": {
    "enabled": true,
    "metricsCollected": true,
    "alertingEnabled": true,
    "summary": {
      "requests": {
        "total": 1247,
        "successful": 1189,
        "failed": 58
      },
      "alerts": {
        "total": 0,
        "critical": 0
      }
    }
  }
}
```

### Distributed Traces
```http
GET /traces
```

Get distributed tracing information.

**Query Parameters:**
- `timeRange` (number): Time range in milliseconds

**Response (200):**
```json
{
  "traces": [
    {
      "traceId": "trace_uuid",
      "spans": [
        {
          "spanId": "span_uuid",
          "operationName": "job_application_automation",
          "startTime": "2024-01-15T10:30:00Z",
          "endTime": "2024-01-15T10:32:00Z",
          "duration": 120000,
          "status": "success",
          "tags": {
            "jobId": "job_uuid",
            "userId": "user_uuid",
            "company": "TechCorp"
          }
        }
      ]
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Security

### Generate CSRF Token
```http
GET /security/csrf-token
```

Generate CSRF token for form protection.

**Response (200):**
```json
{
  "token": "csrf_token_string",
  "cookieName": "__csrf",
  "headerName": "x-csrf-token"
}
```

### Security Metrics
```http
GET /security/metrics
```

Get security metrics and events.

**Response (200):**
```json
{
  "metrics": {
    "securityEvents": {
      "auth_failure": 23,
      "rate_limit_exceeded": 12,
      "suspicious_activity": 3
    },
    "blockedRequests": 38,
    "csrfTokensGenerated": 456,
    "csrfFailures": 2,
    "attacksBlocked": 8,
    "suspiciousIPs": 5,
    "lastSecurityEvent": "2024-01-15T10:25:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Security Health
```http
GET /security/health
```

Get security system health status.

**Response (200):**
```json
{
  "status": "healthy",
  "details": {
    "recentEvents": 5,
    "criticalEvents": 0,
    "highSeverityEvents": 1,
    "suspiciousIPs": 2,
    "blockedRequests": 15,
    "attacksBlocked": 3,
    "csrfTokensGenerated": 123,
    "csrfFailures": 0,
    "lastSecurityEvent": "2024-01-15T10:20:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## WebSocket Events

The API provides real-time updates via WebSocket connections.

### Connection
```javascript
const ws = new WebSocket('wss://api.jobswipe.com');
```

### Authentication
Send authentication after connection:
```json
{
  "type": "auth",
  "token": "jwt_access_token"
}
```

### Event Types

#### Job Queued
```json
{
  "event": "job-queued",
  "data": {
    "applicationId": "app_uuid",
    "jobId": "job_uuid",
    "status": "queued",
    "jobTitle": "Senior Developer",
    "company": "TechCorp",
    "queuedAt": "2024-01-15T10:30:00Z",
    "queuePosition": 5,
    "estimatedTime": "~15 minutes",
    "isPriority": false
  }
}
```

#### Automation Progress
```json
{
  "event": "automation-progress",
  "data": {
    "applicationId": "app_uuid",
    "jobId": "job_uuid",
    "progress": {
      "step": "Filling application form",
      "percentage": 65,
      "message": "Entering personal information",
      "timestamp": "2024-01-15T10:35:00Z"
    },
    "status": "processing",
    "executionId": "exec_uuid"
  }
}
```

#### Application Status Update
```json
{
  "event": "application-status-update",
  "data": {
    "applicationId": "app_uuid",
    "jobId": "job_uuid",
    "jobTitle": "Senior Developer",
    "company": "TechCorp",
    "status": "completed",
    "timestamp": "2024-01-15T10:40:00Z"
  }
}
```

#### Queue Position Update
```json
{
  "event": "queue-position-update",
  "data": {
    "applicationId": "app_uuid",
    "status": "queued",
    "queuePosition": 3,
    "estimatedWaitTime": "~9 minutes",
    "isPriority": false,
    "timestamp": "2024-01-15T10:32:00Z"
  }
}
```

#### Notification
```json
{
  "event": "notification",
  "data": {
    "id": "notification_uuid",
    "type": "success",
    "title": "Application Completed",
    "message": "Successfully applied to Senior Developer at TechCorp",
    "applicationId": "app_uuid",
    "jobId": "job_uuid",
    "timestamp": "2024-01-15T10:40:00Z",
    "duration": 8000,
    "actions": [
      {
        "label": "View Details",
        "action": "navigate:/applications/app_uuid",
        "variant": "primary"
      }
    ]
  }
}
```

## SDK Examples

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

class JobSwipeAPI {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = 'https://api.jobswipe.com/api/v1') {
    this.baseURL = baseURL;
  }

  async login(email: string, password: string) {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email,
      password,
      source: 'web'
    });

    this.accessToken = response.data.tokens.accessToken;
    return response.data;
  }

  async getJobRecommendations(filters = {}) {
    return axios.get(`${this.baseURL}/jobs/recommendations`, {
      params: filters,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });
  }

  async swipeJob(jobId: string, direction: 'LEFT' | 'RIGHT', options = {}) {
    return axios.post(`${this.baseURL}/jobs/${jobId}/swipe`, {
      direction,
      ...options,
      metadata: {
        source: 'web',
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getApplications(status?: string) {
    return axios.get(`${this.baseURL}/queue/applications`, {
      params: status ? { status } : {},
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });
  }
}

// Usage
const api = new JobSwipeAPI();

// Login
await api.login('user@example.com', 'password');

// Get job recommendations
const jobs = await api.getJobRecommendations({
  location: 'San Francisco',
  remote: true,
  salaryMin: 100000
});

// Swipe right on a job
await api.swipeJob('job_uuid', 'RIGHT', {
  coverLetter: 'I am excited about this opportunity...'
});

// Get applications
const applications = await api.getApplications('completed');
```

### Python Example

```python
import requests
from typing import Optional, Dict, Any

class JobSwipeAPI:
    def __init__(self, base_url: str = "https://api.jobswipe.com/api/v1"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.session = requests.Session()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        response = self.session.post(f"{self.base_url}/auth/login", json={
            "email": email,
            "password": password,
            "source": "api"
        })
        response.raise_for_status()

        data = response.json()
        self.access_token = data["tokens"]["accessToken"]
        self.session.headers.update({
            "Authorization": f"Bearer {self.access_token}"
        })

        return data

    def get_job_recommendations(self, **filters) -> Dict[str, Any]:
        response = self.session.get(
            f"{self.base_url}/jobs/recommendations",
            params=filters
        )
        response.raise_for_status()
        return response.json()

    def swipe_job(self, job_id: str, direction: str, **options) -> Dict[str, Any]:
        payload = {
            "direction": direction,
            **options,
            "metadata": {
                "source": "api",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }

        response = self.session.post(
            f"{self.base_url}/jobs/{job_id}/swipe",
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Usage
api = JobSwipeAPI()

# Login
api.login("user@example.com", "password")

# Get recommendations
jobs = api.get_job_recommendations(location="San Francisco", remote=True)

# Swipe right
result = api.swipe_job("job_uuid", "RIGHT",
                      cover_letter="Excited about this role!")
```

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/jobswipe

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server
PORT=3001
NODE_ENV=production
```

### Optional Variables
```env
# Monitoring
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000
ALERT_WEBHOOK_URL=https://webhook.site/your-webhook

# Security
CSRF_ENABLED=true
CSRF_SECRET=csrf-secret-key
RATE_LIMITING_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100

# Features
SERVER_AUTOMATION_ENABLED=true
WEBSOCKET_ENABLED=true
QUEUE_ENABLED=true

# External Services
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
S3_BUCKET=jobswipe-files
```

### Development Variables
```env
# Development
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DOCS=true
ENABLE_PLAYGROUND=true

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

---

## Quick Start

1. **Authentication**: Login to get access and refresh tokens
2. **Get Jobs**: Fetch job recommendations for swiping
3. **Swipe Jobs**: Swipe right on interesting jobs to trigger automation
4. **Monitor Progress**: Check application status and queue position
5. **Desktop App**: Use token exchange for desktop automation

For more examples and detailed integration guides, visit our [Developer Documentation](https://docs.jobswipe.com).

## Support

- **API Support**: api-support@jobswipe.com
- **Documentation**: https://docs.jobswipe.com
- **Status Page**: https://status.jobswipe.com
- **GitHub Issues**: https://github.com/jobswipe/api/issues