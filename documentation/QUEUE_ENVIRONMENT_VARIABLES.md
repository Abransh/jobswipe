# Queue System Environment Variables

This document describes all environment variables required for the BullMQ-based queue system.

## 📋 Required Environment Variables

### Redis Configuration (Required for BullMQ)

```bash
# Redis host
REDIS_HOST=localhost

# Redis port
REDIS_PORT=6379

# Redis password (optional for local, required for production)
REDIS_PASSWORD=your_redis_password

# Redis database number (default: 0)
REDIS_DB=0

# Redis SSL (set to 'true' for production)
REDIS_SSL=false
```

### Queue Configuration

```bash
# Worker concurrency (number of jobs processed simultaneously)
# Default: 5
# Recommendation: 3-10 depending on server resources
QUEUE_CONCURRENCY=5

# Rate limiting - max jobs per duration
# Default: 10 jobs per 1000ms
QUEUE_RATE_LIMIT_MAX=10
QUEUE_RATE_LIMIT_DURATION=1000

# Enable/disable queue worker (useful for web-only instances)
# Default: true
QUEUE_WORKER_ENABLED=true
```

### Database Configuration (Required for dual-persistence)

```bash
# PostgreSQL database URL
DATABASE_URL=postgresql://user:password@localhost:5432/jobswipe

# Connection pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

## 🔧 Optional Configuration

### Job Retry Configuration

```bash
# Maximum retry attempts for failed jobs
# Default: 3
QUEUE_MAX_ATTEMPTS=3

# Initial backoff delay in milliseconds
# Default: 5000 (5 seconds)
# Note: Uses exponential backoff (5s, 10s, 20s...)
QUEUE_BACKOFF_DELAY=5000
```

### Job Retention Configuration

```bash
# Number of completed jobs to keep in BullMQ
# Default: 1000
QUEUE_REMOVE_ON_COMPLETE=1000

# Number of failed jobs to keep in BullMQ
# Default: 5000
QUEUE_REMOVE_ON_FAIL=5000
```

### Queue Names (Advanced)

```bash
# Main queue name
# Default: 'job-applications'
QUEUE_APPLICATIONS_NAME=job-applications

# Priority queue name
# Default: 'job-applications-priority'
QUEUE_PRIORITY_NAME=job-applications-priority
```

## 🚀 Production Recommendations

### Minimum Production Setup

```bash
# Redis
REDIS_HOST=your-redis-production-host.com
REDIS_PORT=6379
REDIS_PASSWORD=strong_production_password
REDIS_SSL=true

# Database
DATABASE_URL=postgresql://user:password@production-db:5432/jobswipe

# Queue Settings
QUEUE_CONCURRENCY=5
QUEUE_WORKER_ENABLED=true
QUEUE_MAX_ATTEMPTS=3
```

### High-Traffic Production Setup

```bash
# Redis (use Redis cluster or managed service)
REDIS_HOST=redis-cluster-master.example.com
REDIS_PORT=6379
REDIS_PASSWORD=strong_production_password
REDIS_SSL=true

# Queue Settings (higher concurrency for more throughput)
QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT_MAX=20
QUEUE_RATE_LIMIT_DURATION=1000

# Retention (keep fewer jobs to save memory)
QUEUE_REMOVE_ON_COMPLETE=500
QUEUE_REMOVE_ON_FAIL=1000
```

## 🧪 Development/Testing Setup

```bash
# Redis (local)
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD= (leave empty for local development)

# Queue Settings (lower concurrency for debugging)
QUEUE_CONCURRENCY=2
QUEUE_WORKER_ENABLED=true

# Keep more failed jobs for debugging
QUEUE_REMOVE_ON_FAIL=10000
```

## 📊 Monitoring Variables

```bash
# Enable detailed logging
LOG_LEVEL=info

# Enable monitoring endpoints
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000

# Alert thresholds
ALERT_QUEUE_DEPTH_THRESHOLD=100
ALERT_ERROR_RATE_THRESHOLD=0.05
```

## 🔍 Health Check Endpoints

After setting environment variables, verify queue health:

- **Queue Health**: `GET /health/queue`
  - Returns: Queue status, job counts, worker status

- **Queue Stats**: `GET /queue/stats`
  - Returns: Detailed statistics, recent jobs

- **Overall Health**: `GET /health`
  - Returns: System health including queue status

## ⚠️ Common Issues

### Issue: "Redis connection failed"
**Solution**: Verify REDIS_HOST and REDIS_PORT are correct
```bash
# Test Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
# Should return: PONG
```

### Issue: "Worker not processing jobs"
**Solution**: Check QUEUE_WORKER_ENABLED is set to true
```bash
QUEUE_WORKER_ENABLED=true
```

### Issue: "Jobs disappearing on restart"
**Solution**: Verify DATABASE_URL is configured (dual-persistence requires database)
```bash
# Jobs are restored from PostgreSQL on startup
DATABASE_URL=postgresql://...
```

## 📚 Additional Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [JobSwipe Queue System Audit Report](./QUEUE_SYSTEM_AUDIT.md)

---

**Last Updated**: 2025-11-18  
**Version**: 2.0.0 (Production-Ready Queue System)
