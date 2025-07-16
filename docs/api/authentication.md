# JobSwipe Authentication API Documentation

## Overview

The JobSwipe Authentication API provides comprehensive authentication and authorization services for web and desktop applications. This document covers all authentication endpoints, request/response formats, and integration guidelines.

## Base Information

- **Base URL**: `https://api.jobswipe.io` (Production) / `http://localhost:3000` (Development)
- **API Version**: v1
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## Authentication Flow

### 1. Web Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth API
    participant D as Database
    participant R as Redis
    
    C->>A: POST /auth/register
    A->>D: Create user
    A->>R: Create session
    A->>C: Return tokens + user
    
    C->>A: POST /auth/login
    A->>D: Validate credentials
    A->>R: Create session
    A->>C: Return tokens + user
```

### 2. Desktop Authentication Flow

```mermaid
sequenceDiagram
    participant D as Desktop App
    participant W as Web Browser
    participant A as Auth API
    participant R as Redis
    
    D->>A: POST /auth/token-exchange/initiate
    A->>R: Store exchange token
    A->>D: Return QR code URL
    
    D->>W: Open auth URL
    W->>A: User authenticates
    W->>A: POST /auth/token-exchange/complete
    A->>R: Validate exchange token
    A->>W: Return desktop tokens
    W->>D: Send tokens via IPC
```

## Endpoints

### Authentication

#### Register User

Creates a new user account with email and password.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "source": "web",
  "termsAccepted": true,
  "privacyAccepted": true,
  "marketingConsent": false,
  "timezone": "America/New_York",
  "companySize": "Startup (1-50 employees)",
  "industry": "Technology"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "timezone": "America/New_York"
    },
    "emailVerified": null,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000
  },
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2023-12-01T10:15:00.000Z"
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "success": false,
  "error": "User already exists",
  "errorCode": "CONFLICT"
}
```

#### Login User

Authenticates existing user with email and password.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "source": "web",
  "rememberMe": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "emailVerified": "2023-12-01T09:00:00.000Z",
    "lastLoginAt": "2023-12-01T10:00:00.000Z",
    "createdAt": "2023-12-01T09:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000
  },
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2023-12-01T10:15:00.000Z"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid email or password",
  "errorCode": "INVALID_CREDENTIALS"
}
```

#### Refresh Token

Refreshes an expired access token using a valid refresh token.

**Endpoint**: `POST /auth/token/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresIn": 2592000
  }
}
```

#### Logout User

Revokes user session and tokens.

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Password Management

#### Request Password Reset

Initiates password reset flow by sending reset email.

**Endpoint**: `POST /auth/password/reset`

**Request Body**:
```json
{
  "email": "user@example.com",
  "source": "web"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

#### Change Password

Changes user password (requires authentication).

**Endpoint**: `POST /auth/password/change`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### User Profile

#### Get User Profile

Retrieves authenticated user's profile information.

**Endpoint**: `GET /auth/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "timezone": "America/New_York"
    },
    "emailVerified": "2023-12-01T09:00:00.000Z",
    "lastLoginAt": "2023-12-01T10:00:00.000Z",
    "createdAt": "2023-12-01T09:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### Desktop Authentication

#### Initiate Token Exchange

Initiates desktop app authentication flow.

**Endpoint**: `POST /auth/token-exchange/initiate`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440002",
  "deviceName": "John's MacBook Pro",
  "platform": "darwin",
  "deviceType": "desktop",
  "appVersion": "1.0.0",
  "osVersion": "macOS 14.0"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "exchangeToken": "xchg_1234567890abcdef",
  "expiresAt": "2023-12-01T10:05:00.000Z",
  "qrCodeUrl": "https://api.jobswipe.io/auth/exchange/xchg_1234567890abcdef",
  "deepLinkUrl": "jobswipe://auth/exchange?token=xchg_1234567890abcdef"
}
```

#### Complete Token Exchange

Completes desktop app authentication flow.

**Endpoint**: `POST /auth/token-exchange/complete`

**Request Body**:
```json
{
  "exchangeToken": "xchg_1234567890abcdef",
  "deviceId": "550e8400-e29b-41d4-a716-446655440002",
  "deviceName": "John's MacBook Pro",
  "platform": "darwin",
  "deviceType": "desktop",
  "appVersion": "1.0.0",
  "osVersion": "macOS 14.0"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 7776000
  },
  "sessionId": "550e8400-e29b-41d4-a716-446655440003"
}
```

### Multi-Factor Authentication

#### Setup TOTP

Initiates TOTP (Time-based One-Time Password) setup.

**Endpoint**: `POST /auth/mfa/setup/totp`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "setup": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "otpauth://totp/JobSwipe:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=JobSwipe",
    "manualEntryKey": "JBSWY3DPEHPK3PXP",
    "backupCodes": [
      "12345678",
      "87654321",
      "11111111",
      "22222222",
      "33333333"
    ]
  }
}
```

#### Verify MFA

Verifies MFA setup with generated code.

**Endpoint**: `POST /auth/mfa/verify`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "code": "123456",
  "method": "totp"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "backupCodes": [
    "12345678",
    "87654321",
    "11111111",
    "22222222",
    "33333333"
  ]
}
```

### Session Management

#### Get Active Sessions

Retrieves all active sessions for the authenticated user.

**Endpoint**: `GET /auth/sessions`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "deviceType": "desktop",
      "deviceName": "John's MacBook Pro",
      "platform": "darwin",
      "browser": "Chrome 120.0",
      "ipAddress": "192.168.1.100",
      "location": {
        "city": "San Francisco",
        "country": "United States",
        "countryCode": "US"
      },
      "isCurrentSession": true,
      "lastActivity": "2023-12-01T10:00:00.000Z",
      "createdAt": "2023-12-01T09:00:00.000Z",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
      "trusted": true
    }
  ]
}
```

#### Terminate Session

Terminates a specific session.

**Endpoint**: `POST /auth/sessions/terminate`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

#### Terminate All Other Sessions

Terminates all sessions except the current one.

**Endpoint**: `POST /auth/sessions/terminate-all`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All other sessions terminated successfully"
}
```

### Security Events

#### Get Security Events

Retrieves security events for the authenticated user.

**Endpoint**: `GET /auth/security-events`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "type": "login",
      "description": "Successful login from new device",
      "timestamp": "2023-12-01T10:00:00.000Z",
      "ipAddress": "192.168.1.100",
      "location": "San Francisco, US",
      "severity": "low"
    }
  ]
}
```

## Error Handling

### Standard Error Response

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "errorCode": "MACHINE_READABLE_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_INVALID` | 401 | Invalid or expired token |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `ACCOUNT_DISABLED` | 401 | Account is disabled |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INTERNAL_ERROR` | 500 | Server error |

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **Login attempts**: 5 per 15 minutes per IP
- **Registration**: 3 per hour per IP
- **Password reset**: 3 per hour per email
- **Token refresh**: 10 per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 2023-12-01T10:15:00.000Z
```

## Security

### JWT Token Structure

Access tokens are JWTs containing:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "iat": 1701417600,
  "exp": 1701418500,
  "aud": "jobswipe-api",
  "iss": "jobswipe-auth",
  "jti": "550e8400-e29b-41d4-a716-446655440005",
  "type": "access",
  "source": "web",
  "sessionId": "550e8400-e29b-41d4-a716-446655440001",
  "permissions": ["read:profile", "write:applications"],
  "features": ["job_search", "resume_builder"]
}
```

### Token Expiration

| Token Type | Expiration |
|------------|------------|
| Access Token | 15 minutes |
| Refresh Token | 30 days |
| Desktop Token | 90 days |
| Exchange Token | 5 minutes |

### Security Headers

All responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Testing

### Postman Collection

Import the Postman collection for testing:

```json
{
  "info": {
    "name": "JobSwipe Authentication API",
    "description": "Collection for testing authentication endpoints",
    "version": "1.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  },
  "variables": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

### cURL Examples

#### Register User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "source": "web",
    "termsAccepted": true,
    "privacyAccepted": true
  }'
```

#### Login User

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "source": "web"
  }'
```

#### Get Profile

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Integration Examples

### JavaScript/TypeScript

```typescript
class AuthClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      this.accessToken = data.tokens.accessToken;
    }

    return data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success) {
      this.accessToken = data.tokens.accessToken;
    }

    return data;
  }

  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    return await response.json();
  }
}
```

### Python

```python
import requests
from typing import Dict, Any

class AuthClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.access_token = None

    def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        data = response.json()
        
        if data.get("success"):
            self.access_token = data["tokens"]["accessToken"]
        
        return data

    def login(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/auth/login",
            json=credentials,
            headers={"Content-Type": "application/json"}
        )
        
        data = response.json()
        
        if data.get("success"):
            self.access_token = data["tokens"]["accessToken"]
        
        return data

    def get_profile(self) -> Dict[str, Any]:
        response = requests.get(
            f"{self.base_url}/auth/profile",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        
        return response.json()
```

## Support

For API support and questions:

- **Documentation**: [https://docs.jobswipe.io](https://docs.jobswipe.io)
- **Support Email**: [api-support@jobswipe.io](mailto:api-support@jobswipe.io)
- **GitHub Issues**: [https://github.com/jobswipe/api/issues](https://github.com/jobswipe/api/issues)

## Changelog

### Version 1.0.0 (2023-12-01)

- Initial release
- Core authentication endpoints
- Desktop token exchange
- Multi-factor authentication
- Session management
- Security event logging

---

*This documentation is maintained by the JobSwipe team and is subject to change. Please refer to the latest version for up-to-date information.*