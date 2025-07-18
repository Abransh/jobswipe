# JobSwipe Enterprise API Documentation

## Overview

This document covers the enterprise-grade features and API endpoints implemented in Phase 2 of the JobSwipe platform. These features provide production-ready security, monitoring, logging, and observability capabilities.

## Table of Contents

1. [Security API](#security-api)
2. [Monitoring API](#monitoring-api)
3. [Health Check API](#health-check-api)
4. [Authentication API](#authentication-api)
5. [Environment Configuration](#environment-configuration)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Security API

### CSRF Token Generation
Generate CSRF tokens for secure form submissions.

**Endpoint:** `GET /security/csrf-token`

**Authentication:** Required

**Response:**
```json
{
  "token": "abc123...",
  "cookieName": "__csrf",
  "headerName": "x-csrf-token"
}
```

**Usage Example:**
```typescript
const response = await fetch('/security/csrf-token', {
  headers: { 'Authorization': 'Bearer ' + accessToken }
});
const { token } = await response.json();

// Use token in subsequent requests
await fetch('/api/protected-endpoint', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken,
    'x-csrf-token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### Security Metrics
Get real-time security metrics and statistics.

**Endpoint:** `GET /security/metrics`

**Authentication:** Required

**Response:**
```json
{
  "timestamp": "2024-01-15T12:00:00Z",
  "metrics": {
    "securityEvents": {
      "total": 42,
      "blocked": 38,
      "byType": {
        "xss_attempt": 15,
        "sql_injection_attempt": 8,
        "csrf_attack": 5,
        "rate_limit_exceeded": 14
      }
    },
    "rateLimiting": {
      "requestsBlocked": 156,
      "currentlyLimited": 3
    },
    "csrfProtection": {
      "tokensGenerated": 1248,
      "tokensValidated": 1195,
      "failures": 12
    }
  }
}
```

### Security Health Status
Check the health status of security systems.

**Endpoint:** `GET /security/health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "details": {
    "attacksBlocked": 38,
    "suspiciousIPs": 5,
    "csrfTokensGenerated": 1248,
    "rateLimitingActive": true
  }
}
```

---

## Monitoring API

### Application Metrics
Get comprehensive application and system metrics.

**Endpoint:** `GET /metrics`

**Query Parameters:**
- `timeRange` (optional): Time range in milliseconds (default: 3600000 - 1 hour)

**Authentication:** Not required

**Response:**
```json
{
  "timestamp": "2024-01-15T12:00:00Z",
  "summary": {
    "requests": {
      "total": 15420,
      "successful": 14896,
      "failed": 524,
      "averageResponseTime": 245,
      "requestRate": 4.28
    },
    "system": {
      "cpu": 23.5,
      "memory": 68.2,
      "uptime": 345600,
      "connections": 128
    },
    "alerts": {
      "total": 2,
      "critical": 0,
      "high": 1,
      "recent": [
        {
          "type": "performance",
          "severity": "medium",
          "title": "Slow Response Time",
          "timestamp": "2024-01-15T11:45:00Z"
        }
      ]
    }
  },
  "detailed": {
    "requests": [...],
    "system": [...],
    "business": [...],
    "traces": [...]
  }
}
```

### Monitoring Health
Check the health status of monitoring systems.

**Endpoint:** `GET /health/monitoring`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "monitoring": {
    "enabled": true,
    "metricsCollected": true,
    "alertingEnabled": true,
    "summary": {
      "requests": {
        "total": 15420,
        "successful": 14896,
        "failed": 524
      },
      "alerts": {
        "total": 2,
        "critical": 0
      }
    }
  }
}
```

### Distributed Traces
Get distributed tracing information.

**Endpoint:** `GET /traces`

**Query Parameters:**
- `timeRange` (optional): Time range in milliseconds (default: 3600000 - 1 hour)

**Authentication:** Not required

**Response:**
```json
{
  "timestamp": "2024-01-15T12:00:00Z",
  "traces": [
    {
      "traceId": "abc123...",
      "spans": [
        {
          "spanId": "def456...",
          "operationName": "POST /api/auth/login",
          "startTime": "2024-01-15T11:59:30Z",
          "endTime": "2024-01-15T11:59:30.245Z",
          "duration": 245,
          "status": "success",
          "tags": {
            "http.method": "POST",
            "http.status_code": 200
          },
          "logs": []
        }
      ]
    }
  ]
}
```

---

## Health Check API

### Basic Health Check
Quick health status for load balancers.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 345600,
  "database": "connected"
}
```

### Detailed Health Check
Comprehensive health check with all system components.

**Endpoint:** `GET /health/detailed`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 12
    },
    "memory": {
      "status": "healthy",
      "usage": 734003200,
      "limit": 1073741824
    },
    "redis": {
      "status": "healthy",
      "latency": 3
    }
  }
}
```

### Services Health
Health status of all registered services.

**Endpoint:** `GET /health/services`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "services": {
    "jwt": {
      "status": "healthy",
      "details": {
        "keysRotated": true,
        "tokensActive": 1248
      }
    },
    "session": {
      "status": "healthy",
      "details": {
        "activeSessions": 356,
        "redisConnected": true
      }
    },
    "security": {
      "status": "healthy",
      "details": {
        "rateLimitEntries": 128,
        "blockedIps": 5
      }
    }
  }
}
```

### Kubernetes Probes

**Readiness Probe:** `GET /ready`
```json
{ "status": "ready" }
```

**Liveness Probe:** `GET /live`
```json
{ 
  "status": "alive",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

## Authentication API

### User Registration
Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "source": "web",
  "termsAccepted": true,
  "privacyAccepted": true,
  "marketingConsent": false
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "emailVerified": false,
    "createdAt": "2024-01-15T12:00:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800
  },
  "session": {
    "id": "session_456",
    "expiresAt": "2024-01-15T13:00:00Z"
  }
}
```

### User Login
Authenticate a user and create a session.

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "source": "web",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "lastLoginAt": "2024-01-15T12:00:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800
  },
  "session": {
    "id": "session_456",
    "expiresAt": "2024-01-15T13:00:00Z"
  }
}
```

### Token Refresh
Refresh an expired access token.

**Endpoint:** `POST /api/v1/auth/token/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800
  }
}
```

---

## Environment Configuration

### Security Environment Variables
```bash
# CSRF Protection
CSRF_ENABLED=true
CSRF_SECRET=your-secure-csrf-secret-key-here

# Content Security Policy
CSP_ENABLED=true
CSP_REPORT_ONLY=false
CSP_REPORT_URI=/security/csp-violations

# Attack Detection
ATTACK_DETECTION_ENABLED=true
XSS_DETECTION_ENABLED=true
SQL_INJECTION_DETECTION_ENABLED=true
PATH_TRAVERSAL_DETECTION_ENABLED=true
COMMAND_INJECTION_DETECTION_ENABLED=true

# Rate Limiting
RATE_LIMITING_ENABLED=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Monitoring Environment Variables
```bash
# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000
MONITORING_RETENTION=86400000

# Alerting Configuration
ALERTING_ENABLED=true
ALERT_WEBHOOK_URL=https://your-webhook-endpoint.com
ALERT_ERROR_RATE_THRESHOLD=0.05
ALERT_RESPONSE_TIME_THRESHOLD=2000
ALERT_MEMORY_THRESHOLD=85
ALERT_CPU_THRESHOLD=80

# System Monitoring
MONITOR_CPU=true
MONITOR_MEMORY=true
MONITOR_DISK=true
MONITOR_NETWORK=true

# Business Metrics
MONITOR_USERS=true
MONITOR_REQUESTS=true
MONITOR_ERRORS=true
MONITOR_SECURITY=true
```

### Logging Environment Variables
```bash
# Logging Configuration
LOG_LEVEL=info
LOG_STRUCTURED=true
LOG_PRETTY_PRINT=false
LOG_INCLUDE_PII=false
LOG_REDACT_FIELDS=password,token,secret,key

# Audit Logging
AUDIT_LOGGING_ENABLED=true
AUDIT_INCLUDE_REQUEST_BODY=false
AUDIT_INCLUDE_RESPONSE_BODY=false
AUDIT_MAX_BODY_SIZE=10240

# Performance Logging
PERFORMANCE_LOGGING_ENABLED=true
SLOW_REQUEST_THRESHOLD=1000
PERFORMANCE_TRACK_MEMORY=true
PERFORMANCE_TRACK_CPU=true

# Error Handling
ERROR_INCLUDE_STACK_TRACE=false
ERROR_NOTIFY_CRITICAL=true
ERROR_RETRYABLE_CODES=DATABASE_CONNECTION_ERROR,NETWORK_TIMEOUT

# Correlation
CORRELATION_ENABLED=true
CORRELATION_HEADER_NAME=x-correlation-id
CORRELATION_GENERATE_IF_MISSING=true
```

---

## Error Handling

### Standard Error Response Format
All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "requestId": "req_123456",
  "timestamp": "2024-01-15T12:00:00Z",
  "retryable": false
}
```

### Error Classification

#### Authentication Errors (401)
```json
{
  "success": false,
  "error": "Authentication failed. Please check your credentials and try again.",
  "code": "AUTH_TOKEN_INVALID",
  "requestId": "req_123456",
  "timestamp": "2024-01-15T12:00:00Z",
  "retryable": false
}
```

#### Authorization Errors (403)
```json
{
  "success": false,
  "error": "You do not have permission to perform this action.",
  "code": "INSUFFICIENT_PERMISSIONS",
  "requestId": "req_123456",
  "timestamp": "2024-01-15T12:00:00Z",
  "retryable": false
}
```

#### Validation Errors (400)
```json
{
  "success": false,
  "error": "The provided data is invalid. Please check your input and try again.",
  "code": "VALIDATION_ERROR",
  "requestId": "req_123456",
  "timestamp": "2024-01-15T12:00:00Z",
  "retryable": false,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### Rate Limiting Errors (429)
```json
{
  "success": false,
  "error": "Too many requests. Please wait a moment and try again.",
  "code": "RATE_LIMIT_EXCEEDED",
  "requestId": "req_123456",
  "timestamp": "2024-01-15T12:00:00Z",
  "retryable": true,
  "retryAfter": 60
}
```

#### Security Violations (403)
```json
{
  "success": false,
  "error": "Security violation detected",
  "code": "SECURITY_VIOLATION",
  "requestId": "req_123456",
  "timestamp": "2024-01-15T12:00:00Z",
  "retryable": false
}
```

---

## Rate Limiting

### Rate Limit Headers
All responses include rate limiting information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

### Rate Limit Configuration
- **Window**: 15 minutes (900,000ms)
- **Max Requests**: 100 per window per IP
- **Algorithm**: Sliding window with Redis backing
- **Scope**: Per IP address and route combination

### Rate Limit Bypass
Certain IPs can be allowlisted:
- `127.0.0.1` (localhost)
- Configured allowlist IPs via `RATE_LIMIT_ALLOWLIST` environment variable

---

## Security Headers

All responses include comprehensive security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

---

## Request Correlation

### Correlation Headers
All requests and responses include correlation tracking:

**Request Header:**
```
X-Correlation-ID: corr_123456789
```

**Response Headers:**
```
X-Correlation-ID: corr_123456789
X-Request-ID: req_987654321
```

### Distributed Tracing
The platform supports distributed tracing with:
- **Trace ID**: Unique identifier for request flow
- **Span ID**: Unique identifier for operation
- **Parent Span ID**: Reference to parent operation
- **Operation Name**: Description of the operation
- **Tags**: Key-value metadata
- **Logs**: Timestamped events within the span

---

## Performance Considerations

### Response Time Targets
- **Authentication**: < 200ms
- **Health Checks**: < 50ms
- **Metrics Endpoints**: < 500ms
- **Business Operations**: < 1000ms

### Caching Strategy
- **CSRF Tokens**: In-memory cache with Redis fallback
- **Rate Limit Data**: Redis with TTL
- **Security Events**: In-memory circular buffer
- **Metrics**: Aggregated in-memory with periodic persistence

### Monitoring Overhead
- **Request Tracking**: < 5ms overhead per request
- **Security Scanning**: < 10ms overhead per request
- **Logging**: Asynchronous with minimal impact
- **Metrics Collection**: Background process every 60 seconds

---

This documentation covers the comprehensive enterprise features implemented in Phase 2 of the JobSwipe platform. For additional technical details, refer to the source code and inline documentation in the respective plugin files.