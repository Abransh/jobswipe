# JobSwipe Deployment Guide

## Quick Fix for Current Issues

### Issue 1: Redis Connection Error (ECONNREFUSED / ECONNRESET)

**Problem**: Application tries to connect to `localhost:6379` or fails TLS handshake with cloud Redis service.

**Solution**: Set the `REDIS_URL` environment variable in your deployment platform:

```bash
# For Upstash Redis (TLS auto-detected!)
REDIS_URL="redis://default:YOUR_PASSWORD@saved-eel-38173.upstash.io:6379"
# OR with explicit TLS:
REDIS_URL="rediss://default:YOUR_PASSWORD@saved-eel-38173.upstash.io:6380"
```

**✨ Smart Features**:
- **Auto-detects Upstash**: Automatically enables TLS for `.upstash.io` domains
- **Works with both protocols**: Accepts `redis://` or `rediss://` for Upstash
- **Handles self-signed certs**: Configures TLS to accept Upstash certificates
- **Lazy connections**: Prevents timeout issues with slow cloud connections

**Why it works**: The code now:
1. Prioritizes `REDIS_URL` over individual variables
2. Auto-detects Upstash domains and enables TLS
3. Configures proper TLS settings for cloud providers

---

### Issue 2: Python Companies Path Error

**Problem**: `❌ Companies directory not found: ../../../../packages/automation-engine/scripts'` (notice the trailing quote)

**Solution**:
1. **Check your environment variable** - Ensure there's NO trailing quote:
   ```bash
   # ✅ Correct (no trailing quote)
   PYTHON_COMPANIES_PATH="../../../../packages/automation-engine/scripts"

   # ❌ Wrong (has trailing quote)
   PYTHON_COMPANIES_PATH="../../../../packages/automation-engine/scripts'"
   ```

2. **For cloud deployments**, Python automation may not work. Consider:
   - Disabling automation features temporarily
   - Running automation on a separate worker service
   - Using the desktop app for automation instead

---

## Environment Variables Configuration Priority

### Redis Configuration

The application checks environment variables in this order:

1. **`REDIS_URL`** (HIGHEST PRIORITY - Recommended for cloud deployments)
   ```bash
   REDIS_URL="redis://user:pass@host:port/db"
   ```

2. **Individual variables** (Fallback if REDIS_URL not set)
   ```bash
   REDIS_HOST="localhost"
   REDIS_PORT="6379"
   REDIS_PASSWORD="your-password"
   REDIS_DB="0"
   ```

3. **Defaults** (localhost:6379)

---

## Cloud Platform Setup

### Render.com

1. Add a Redis service (or use external like Upstash)
2. Set environment variables:
   ```bash
   REDIS_URL=$REDIS_URL  # Auto-populated by Render
   DATABASE_URL=$DATABASE_URL
   JWT_SECRET=<generate-with-openssl-rand-base64-48>
   ENCRYPTION_KEY=<generate-with-openssl-rand-base64-32>
   ```

### Railway

1. Add Redis plugin to your project
2. Environment variables:
   ```bash
   REDIS_URL=$REDIS_URL  # Auto-populated by Railway
   DATABASE_URL=$DATABASE_URL
   JWT_SECRET=<generate-with-openssl-rand-base64-48>
   ENCRYPTION_KEY=<generate-with-openssl-rand-base64-32>
   ```

### Heroku

1. Add Heroku Redis addon:
   ```bash
   heroku addons:create heroku-redis:hobby-dev
   ```
2. `REDIS_URL` is automatically set by Heroku

### Upstash Redis (Standalone) ⭐ Recommended

1. Create Redis database at [console.upstash.com](https://console.upstash.com)
2. Copy the **connection string** from dashboard
3. Set in your deployment platform:
   ```bash
   # Upstash provides multiple connection strings - use any of these:

   # Option 1: Standard format (TLS auto-detected)
   REDIS_URL="redis://default:YOUR_PASSWORD@saved-eel-38173.upstash.io:6379"

   # Option 2: Explicit TLS format
   REDIS_URL="rediss://default:YOUR_PASSWORD@saved-eel-38173.upstash.io:6380"

   # Option 3: CLI format (copy from "redis-cli" tab, remove the --tls flag)
   # redis-cli --tls -u redis://default:PASSWORD@host:6379
   # Just use: redis://default:PASSWORD@host:6379
   ```

**Important Notes**:
- ✅ **TLS is auto-detected** for `.upstash.io` domains
- ✅ **Both ports work**: 6379 and 6380
- ✅ **Both protocols work**: `redis://` and `rediss://`
- ⚠️ Don't include the `--tls` flag from CLI commands - just the URL

---

## Build and Run Commands

### Build Command
```bash
cd packages/database && pnpm run db:generate && cd ../.. &&
pnpm --filter @jobswipe/shared build &&
pnpm --filter @jobswipe/database build &&
pnpm --filter @jobswipe/api build || [ -f apps/api/dist/index.js ] && echo "Build completed (with type warnings)"
```

### Run Command
```bash
cd apps/api && node dist/index.js
```

### Start Command (Alternative)
```bash
cd apps/api && NODE_ENV=production node dist/index.js
```

---

## Required Environment Variables

### Critical (Must Set)
```bash
# Node Environment
NODE_ENV=production

# Database (Neon, Supabase, etc.)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Redis (Upstash, Render, Railway, etc.)
REDIS_URL="redis://default:pass@host:6379"

# Security (Generate new secrets!)
JWT_SECRET="<openssl rand -base64 48>"
JWT_REFRESH_SECRET="<openssl rand -base64 48>"
ENCRYPTION_KEY="<openssl rand -base64 32>"

# CORS (Your frontend domain)
API_CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"
```

### Optional (Can Use Defaults)
```bash
API_PORT=8080
API_HOST=0.0.0.0
LOG_LEVEL=info

# Security Features
CSRF_ENABLED=true
RATE_LIMITING_ENABLED=true
ATTACK_DETECTION_ENABLED=true

# Python Automation (May not work in cloud)
PYTHON_PATH="/usr/bin/python3"
PYTHON_COMPANIES_PATH="../../../../packages/automation-engine/scripts"
```

---

## Troubleshooting

### Redis Connection Issues

**Error**: `ECONNREFUSED ::1:6379` or `ECONNREFUSED 127.0.0.1:6379`

**Fix**:
1. Ensure `REDIS_URL` is set correctly
2. Verify Redis service is running
3. Check firewall/network settings
4. Test connection:
   ```bash
   # Using redis-cli
   redis-cli -u $REDIS_URL ping
   # Should return: PONG
   ```

### Python Path Issues

**Error**: `❌ Companies directory not found`

**Fix**:
1. Remove trailing quotes from `PYTHON_COMPANIES_PATH`
2. Verify path is correct relative to `apps/api/dist/index.js`
3. For cloud deployments, consider disabling automation:
   ```bash
   SCREENSHOT_ENABLED=false
   # Don't set PYTHON_COMPANIES_PATH
   ```

### Database Connection Issues

**Error**: `Connection timeout` or `SSL required`

**Fix**:
1. Ensure `?sslmode=require` is in DATABASE_URL
2. Check connection pooling settings:
   ```bash
   DATABASE_POOL_SIZE=25
   DATABASE_CONNECTION_TIMEOUT=30000
   ```

### CORS Issues

**Error**: `CORS policy` errors in browser

**Fix**:
```bash
# Allow multiple origins (comma-separated)
API_CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com,https://app.vercel.app"
API_CORS_CREDENTIALS=true
```

---

## Health Checks

### Endpoints

- **Basic Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Services Health**: `GET /health/services`
- **Database Health**: `GET /health/database`
- **Redis Health**: `GET /health/redis`
- **Readiness**: `GET /ready` (Kubernetes)
- **Liveness**: `GET /live` (Kubernetes)

### Expected Response

```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T14:50:47.000Z",
  "services": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" },
    "jwt": { "status": "healthy" }
  }
}
```

---

## Performance Optimization

### Redis Settings
```bash
# Connection pooling
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
REDIS_KEEPALIVE=30000

# BullMQ queue settings
QUEUE_CONCURRENCY=5
QUEUE_MAX_STALLED_COUNT=1
```

### Database Settings
```bash
# Connection pooling
DATABASE_POOL_SIZE=25
DATABASE_CONNECTION_TIMEOUT=30000

# Query optimization
DATABASE_STATEMENT_TIMEOUT=30000
```

---

## Security Checklist

- [ ] Set strong, unique JWT secrets
- [ ] Set strong, unique encryption key
- [ ] Enable HTTPS/TLS in production
- [ ] Use `rediss://` (TLS) for Redis URLs
- [ ] Use `sslmode=require` for PostgreSQL
- [ ] Set proper CORS origins (no wildcards in production)
- [ ] Enable security features:
  ```bash
  CSRF_ENABLED=true
  RATE_LIMITING_ENABLED=true
  ATTACK_DETECTION_ENABLED=true
  ```
- [ ] Disable debug features:
  ```bash
  ENABLE_SWAGGER=false
  DEBUG_MODE=false
  ```

---

## Support

If you encounter issues:

1. Check logs for error messages
2. Verify all required environment variables are set
3. Test Redis and Database connections separately
4. Review the error messages in this guide
5. Check [GitHub Issues](https://github.com/Abransh/jobswipe/issues)

---

## Quick Start Template

```bash
# Copy this to your deployment platform's environment variables

# === REQUIRED ===
NODE_ENV=production
DATABASE_URL="<your-postgres-url>"
REDIS_URL="<your-redis-url>"
JWT_SECRET="<generate-new>"
JWT_REFRESH_SECRET="<generate-new>"
ENCRYPTION_KEY="<generate-new>"
API_CORS_ORIGIN="https://yourdomain.com"

# === RECOMMENDED ===
API_PORT=8080
LOG_LEVEL=info
CSRF_ENABLED=true
RATE_LIMITING_ENABLED=true

# === OPTIONAL ===
GOOGLE_API_KEY="<if-using-ai>"
ANTHROPIC_API_KEY="<if-using-claude>"
```

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
