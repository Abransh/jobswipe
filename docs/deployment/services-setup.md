# JobSwipe Services Setup Guide

## Overview

This guide covers the setup and configuration of all required services for the JobSwipe platform, including databases, caching, storage, and third-party integrations.

## Table of Contents

1. [PostgreSQL Database](#postgresql-database)
2. [Redis Cache](#redis-cache)
3. [AWS S3 Storage](#aws-s3-storage)
4. [Email Services](#email-services)
5. [Authentication Services](#authentication-services)
6. [External API Integrations](#external-api-integrations)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Environment Configuration](#environment-configuration)

---

## PostgreSQL Database

### Option 1: Digital Ocean Managed Database (Recommended)

#### Setup via Digital Ocean Console

1. **Navigate to Databases**
   - Go to [Digital Ocean Console](https://cloud.digitalocean.com)
   - Click "Create" → "Database"

2. **Configuration**
   ```
   Engine: PostgreSQL
   Version: 16
   Plan: Basic
   Machine Type: Basic node (1 GB RAM, 1 vCPU, 10 GB storage)
   Datacenter Region: [Same as your API server]
   VPC Network: Default VPC
   Database Name: jobswipe
   ```

3. **Security Configuration**
   ```
   Trusted Sources: 
   - Your API server droplet IP
   - Your local development IP (for migrations)
   
   Connection Pool Mode: Transaction
   Connection Pool Size: 20
   ```

#### Setup via CLI

```bash
# Create managed PostgreSQL database
doctl databases create jobswipe-db \
  --engine pg \
  --version 16 \
  --size db-s-1vcpu-1gb \
  --region nyc1 \
  --num-nodes 1

# Wait for database to be ready
doctl databases get jobswipe-db

# Get connection details
doctl databases connection jobswipe-db

# Add trusted sources (your server IP)
doctl databases firewall append jobswipe-db --rule type:ip_addr,value:YOUR_SERVER_IP
```

#### Database Configuration

```bash
# Connect to database
psql "postgresql://doadmin:PASSWORD@HOST:25060/defaultdb?sslmode=require"

-- Create application database and user
CREATE DATABASE jobswipe;
CREATE USER jobswipe_user WITH PASSWORD 'SECURE_PASSWORD_HERE';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE jobswipe TO jobswipe_user;
ALTER USER jobswipe_user CREATEDB;

-- Connect to jobswipe database
\c jobswipe;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO jobswipe_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jobswipe_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO jobswipe_user;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For advanced indexing

-- Create read-only user for analytics (optional)
CREATE USER analytics_user WITH PASSWORD 'ANALYTICS_PASSWORD';
GRANT CONNECT ON DATABASE jobswipe TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

### Option 2: Self-Hosted PostgreSQL

```bash
# Create directory for PostgreSQL
mkdir -p ~/jobswipe/database
cd ~/jobswipe/database

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: jobswipe-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: jobswipe
      POSTGRES_USER: jobswipe_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgresql.conf:/etc/postgresql/postgresql.conf
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    networks:
      - jobswipe-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jobswipe_user -d jobswipe"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local

networks:
  jobswipe-network:
    external: true
EOF

# Create PostgreSQL configuration
cat > postgresql.conf << 'EOF'
# Connection Settings
listen_addresses = '*'
port = 5432
max_connections = 100

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# WAL Settings
wal_level = replica
max_wal_size = 1GB
min_wal_size = 80MB
checkpoint_completion_target = 0.7

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_min_duration_statement = 1000

# Locale and Formatting
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'en_US.utf8'
lc_monetary = 'en_US.utf8'
lc_numeric = 'en_US.utf8'
lc_time = 'en_US.utf8'
default_text_search_config = 'pg_catalog.english'
EOF

# Create initialization script
cat > init.sql << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create application user
CREATE USER jobswipe_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE jobswipe TO jobswipe_user;
GRANT ALL ON SCHEMA public TO jobswipe_user;
EOF

# Create environment file
cat > .env << 'EOF'
POSTGRES_PASSWORD=CHANGE_THIS_TO_SECURE_PASSWORD
EOF

# Start PostgreSQL
docker network create jobswipe-network
docker compose up -d

# Check status
docker compose ps
docker compose logs postgres
```

### Database Connection String

```bash
# For Digital Ocean Managed Database
DATABASE_URL="postgresql://jobswipe_user:PASSWORD@HOST:25060/jobswipe?sslmode=require"

# For Self-Hosted Database
DATABASE_URL="postgresql://jobswipe_user:PASSWORD@localhost:5432/jobswipe"
```

---

## Redis Cache

### Option 1: Digital Ocean Managed Redis (Recommended)

#### Setup via Console

1. **Navigate to Databases**
   - Go to Digital Ocean Console → Databases
   - Click "Create Database"

2. **Configuration**
   ```
   Engine: Redis
   Version: 7
   Plan: Basic
   Machine Type: 1 GB RAM
   Datacenter Region: [Same as API server]
   ```

#### Setup via CLI

```bash
# Create managed Redis
doctl databases create jobswipe-redis \
  --engine redis \
  --version 7 \
  --size db-s-1vcpu-1gb \
  --region nyc1 \
  --num-nodes 1

# Get connection details
doctl databases connection jobswipe-redis

# Configure firewall
doctl databases firewall append jobswipe-redis --rule type:ip_addr,value:YOUR_SERVER_IP
```

### Option 2: Self-Hosted Redis

```bash
# Create Redis directory
mkdir -p ~/jobswipe/redis
cd ~/jobswipe/redis

# Create Redis configuration
cat > redis.conf << 'EOF'
# Network
bind 0.0.0.0
port 6379
protected-mode yes
requirepass CHANGE_THIS_REDIS_PASSWORD

# General
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""

# Snapshotting
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./

# Replication
replica-serve-stale-data yes
replica-read-only yes

# Security
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command EVAL ""
rename-command DEBUG ""
rename-command CONFIG ""

# Memory management
maxmemory 1gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Append only file
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Lua scripting
lua-time-limit 5000

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Event notification
notify-keyspace-events ""

# Advanced config
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100

# Active rehashing
activerehashing yes

# Client output buffer limits
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60

# Client query buffer limit
client-query-buffer-limit 1gb

# Protocol buffer limit
proto-max-bulk-len 512mb

# Frequency
hz 10

# Background task
dynamic-hz yes

# AOF rewrite
aof-rewrite-incremental-fsync yes

# RDB save
rdb-save-incremental-fsync yes
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: jobswipe-redis
    restart: unless-stopped
    command: redis-server /usr/local/etc/redis/redis.conf
    ports:
      - "6379:6379"
    volumes:
      - ./redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data:/data
    networks:
      - jobswipe-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    environment:
      - REDIS_REPLICATION_MODE=master

volumes:
  redis_data:
    driver: local

networks:
  jobswipe-network:
    external: true
EOF

# Start Redis
docker compose up -d

# Test connection
docker exec -it jobswipe-redis redis-cli -a CHANGE_THIS_REDIS_PASSWORD ping
```

### Redis Connection Configuration

```bash
# For Digital Ocean Managed Redis
REDIS_URL="rediss://:PASSWORD@HOST:25061"

# For Self-Hosted Redis
REDIS_URL="redis://:PASSWORD@localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
```

---

## AWS S3 Storage

### Setup AWS S3 for File Storage

#### 1. Create AWS Account and IAM User

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

#### 2. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://jobswipe-files-prod --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket jobswipe-files-prod \
  --versioning-configuration Status=Enabled

# Set public access block (security)
aws s3api put-public-access-block \
  --bucket jobswipe-files-prod \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Configure lifecycle policy
cat > lifecycle.json << 'EOF'
{
    "Rules": [
        {
            "ID": "DeleteIncompleteMultipartUploads",
            "Filter": {},
            "Status": "Enabled",
            "AbortIncompleteMultipartUpload": {
                "DaysAfterInitiation": 1
            }
        },
        {
            "ID": "TransitionToIA",
            "Filter": {},
            "Status": "Enabled",
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ]
        }
    ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket jobswipe-files-prod \
  --lifecycle-configuration file://lifecycle.json
```

#### 3. Create IAM Policy and User

```bash
# Create IAM policy
cat > s3-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion",
                "s3:DeleteObjectVersion"
            ],
            "Resource": "arn:aws:s3:::jobswipe-files-prod/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": "arn:aws:s3:::jobswipe-files-prod"
        }
    ]
}
EOF

# Create policy
aws iam create-policy \
  --policy-name JobSwipeS3Policy \
  --policy-document file://s3-policy.json

# Create user
aws iam create-user --user-name jobswipe-s3-user

# Attach policy to user
aws iam attach-user-policy \
  --user-name jobswipe-s3-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/JobSwipeS3Policy

# Create access keys
aws iam create-access-key --user-name jobswipe-s3-user
```

#### 4. Configure CORS for S3

```bash
cat > cors.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors \
  --bucket jobswipe-files-prod \
  --cors-configuration file://cors.json
```

### S3 Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=jobswipe-files-prod
AWS_S3_REGION=us-east-1
AWS_S3_ACL=private

# File upload settings
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png
```

---

## Email Services

### Option 1: AWS SES (Recommended)

#### Setup AWS SES

```bash
# Verify domain
aws sesv2 put-email-identity --email-identity yourdomain.com

# Verify email address for testing
aws sesv2 put-email-identity --email-identity your-email@yourdomain.com

# Create configuration set
aws sesv2 create-configuration-set --configuration-set-name jobswipe-emails

# Get sending quota
aws sesv2 get-account-sending-enabled
aws sesv2 get-send-quota
```

#### SES Environment Variables

```bash
# Email Configuration
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com
```

### Option 2: SendGrid

#### Setup SendGrid

1. **Create Account**: Go to [SendGrid](https://sendgrid.com/)
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Verify Domain**: Settings → Sender Authentication → Domain Authentication

#### SendGrid Environment Variables

```bash
# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com
```

### Option 3: SMTP

```bash
# Email Configuration
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
```

---

## Authentication Services

### JWT Configuration

```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)

# JWT Configuration
JWT_ACCESS_EXPIRATION=3600      # 1 hour
JWT_REFRESH_EXPIRATION=604800   # 7 days
JWT_ISSUER=jobswipe-api
JWT_AUDIENCE=jobswipe-app
```

### Session Configuration

```bash
# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32)
SESSION_EXPIRATION=1800         # 30 minutes
SESSION_KEY_PREFIX=session:
SESSION_COOKIE_NAME=jobswipe_session
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=strict
```

### OAuth Integration (Optional)

#### Google OAuth

1. **Create Project**: Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable APIs**: Enable Google+ API
3. **Create Credentials**: APIs & Services → Credentials → Create OAuth 2.0 Client ID

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

#### GitHub OAuth

1. **Create App**: Go to GitHub Settings → Developer settings → OAuth Apps
2. **Register Application**: Fill in application details

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://yourdomain.com/auth/github/callback
```

---

## External API Integrations

### Job Boards APIs

#### Indeed API (if available)

```bash
# Indeed Configuration
INDEED_PUBLISHER_ID=your-publisher-id
INDEED_API_KEY=your-api-key
INDEED_BASE_URL=https://api.indeed.com/
```

#### LinkedIn API

```bash
# LinkedIn Configuration
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=https://yourdomain.com/auth/linkedin/callback
```

### AI/ML Services

#### OpenAI Integration

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

#### Anthropic Claude (Alternative)

```bash
# Anthropic Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
```

---

## Monitoring & Analytics

### Option 1: Sentry for Error Tracking

#### Setup Sentry

1. **Create Account**: Go to [Sentry.io](https://sentry.io/)
2. **Create Project**: Select Node.js
3. **Get DSN**: Copy the DSN from project settings

```bash
# Sentry Configuration
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Option 2: DataDog (Enterprise)

```bash
# DataDog Configuration
DATADOG_API_KEY=your-datadog-api-key
DATADOG_APP_KEY=your-datadog-app-key
DATADOG_SITE=datadoghq.com
DD_ENV=production
DD_SERVICE=jobswipe-api
DD_VERSION=1.0.0
```

### Option 3: New Relic

```bash
# New Relic Configuration
NEW_RELIC_LICENSE_KEY=your-license-key
NEW_RELIC_APP_NAME=JobSwipe API
NEW_RELIC_LABELS=Environment:production;Team:backend
```

---

## Environment Configuration

### Complete Environment File Template

```bash
# Create comprehensive environment file
cat > .env.production << 'EOF'
# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0
API_PREFIX=/api/v1

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL="postgresql://jobswipe_user:PASSWORD@HOST:25060/jobswipe?sslmode=require"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_URL="rediss://:PASSWORD@HOST:25061"
REDIS_HOST=your-redis-host
REDIS_PORT=25061
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX="jobswipe:"
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100

# =============================================================================
# JWT & SECURITY CONFIGURATION
# =============================================================================
JWT_SECRET=your-jwt-secret-64-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-64-characters-long
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800
JWT_ISSUER=jobswipe-api
JWT_AUDIENCE=jobswipe-app

# Session Configuration
SESSION_SECRET=your-session-secret-32-characters
SESSION_EXPIRATION=1800
SESSION_KEY_PREFIX=session:

# CSRF Protection
CSRF_ENABLED=true
CSRF_SECRET=your-csrf-secret-32-characters

# Security Headers
CSP_ENABLED=true
ATTACK_DETECTION_ENABLED=true

# Rate Limiting
RATE_LIMITING_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# =============================================================================
# FILE STORAGE (AWS S3)
# =============================================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=jobswipe-files-prod
AWS_S3_REGION=us-east-1
AWS_S3_ACL=private

# File Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOG_LEVEL=info
LOG_STRUCTURED=true
AUDIT_LOGGING_ENABLED=true
PERFORMANCE_LOGGING_ENABLED=true
ERROR_INCLUDE_STACK_TRACE=false

# =============================================================================
# MONITORING CONFIGURATION
# =============================================================================
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000
ALERTING_ENABLED=true

# Sentry Configuration
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# =============================================================================
# AI/ML SERVICES
# =============================================================================
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# =============================================================================
# EXTERNAL APIs
# =============================================================================
# Job Boards APIs (when available)
INDEED_PUBLISHER_ID=your-publisher-id
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# =============================================================================
# FEATURE FLAGS
# =============================================================================
FEATURE_OAUTH_LOGIN=true
FEATURE_EMAIL_NOTIFICATIONS=true
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_API_RATE_LIMITING=true
FEATURE_FILE_UPLOADS=true

# =============================================================================
# BACKUP CONFIGURATION
# =============================================================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=jobswipe-backups-prod
EOF

# Secure the environment file
chmod 600 .env.production
```

---

## Service Health Checks

### Database Health Check Script

```bash
# Create health check script
cat > ~/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Check PostgreSQL
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "PostgreSQL is down"
    exit 1
fi

# Check Redis
if ! redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping > /dev/null; then
    echo "Redis is down"
    exit 1
fi

# Check API
if ! curl -f -s http://localhost:3001/health > /dev/null; then
    echo "API is down"
    exit 1
fi

echo "All services are healthy"
EOF

chmod +x ~/scripts/health-check.sh
```

### Service Restart Script

```bash
# Create service restart script
cat > ~/scripts/restart-services.sh << 'EOF'
#!/bin/bash

echo "Restarting JobSwipe services..."

# Restart Redis (if self-hosted)
if [ -f ~/jobswipe/redis/docker-compose.yml ]; then
    cd ~/jobswipe/redis
    docker compose restart
fi

# Restart PostgreSQL (if self-hosted)
if [ -f ~/jobswipe/database/docker-compose.yml ]; then
    cd ~/jobswipe/database
    docker compose restart
fi

# Restart API
sudo systemctl restart jobswipe-api

# Wait and check health
sleep 10
~/scripts/health-check.sh

echo "Services restarted successfully"
EOF

chmod +x ~/scripts/restart-services.sh
```

---

## Backup Strategy

### Automated Backup Script

```bash
# Create comprehensive backup script
cat > ~/scripts/backup-all.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/jobswipe/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Backing up database..."
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/database_backup_${DATE}.sql.gz"

# Redis backup
echo "Backing up Redis..."
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD --rdb - | gzip > "$BACKUP_DIR/redis_backup_${DATE}.rdb.gz"

# Application files backup
echo "Backing up application files..."
tar -czf "$BACKUP_DIR/app_backup_${DATE}.tar.gz" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    --exclude=backups \
    /home/jobswipe/jobswipe/

# Environment files backup
echo "Backing up environment files..."
tar -czf "$BACKUP_DIR/env_backup_${DATE}.tar.gz" \
    /home/jobswipe/jobswipe/apps/api/.env.production \
    /etc/systemd/system/jobswipe-api.service \
    /etc/nginx/sites-available/jobswipe-api

# Upload to S3 (if configured)
if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
    echo "Uploading backups to S3..."
    aws s3 cp "$BACKUP_DIR/database_backup_${DATE}.sql.gz" "s3://$AWS_S3_BACKUP_BUCKET/database/"
    aws s3 cp "$BACKUP_DIR/redis_backup_${DATE}.rdb.gz" "s3://$AWS_S3_BACKUP_BUCKET/redis/"
    aws s3 cp "$BACKUP_DIR/app_backup_${DATE}.tar.gz" "s3://$AWS_S3_BACKUP_BUCKET/application/"
    aws s3 cp "$BACKUP_DIR/env_backup_${DATE}.tar.gz" "s3://$AWS_S3_BACKUP_BUCKET/environment/"
fi

# Clean up old local backups (keep last 7 days)
find $BACKUP_DIR -name "*_backup_*.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed successfully"
EOF

chmod +x ~/scripts/backup-all.sh

# Schedule daily backups
crontab -e
# Add this line:
0 2 * * * /home/jobswipe/scripts/backup-all.sh >> /var/log/backup.log 2>&1
```

---

## Security Hardening

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change 22 to your SSH port if different)
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow PostgreSQL (only from specific IPs if self-hosted)
# sudo ufw allow from YOUR_API_SERVER_IP to any port 5432

# Allow Redis (only from specific IPs if self-hosted)
# sudo ufw allow from YOUR_API_SERVER_IP to any port 6379

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### SSL/TLS Configuration

```bash
# Strong SSL configuration for Nginx
cat >> /etc/nginx/sites-available/jobswipe-api << 'EOF'

# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
EOF
```

---

## Performance Tuning

### PostgreSQL Performance Tuning

```sql
-- Performance optimization queries
-- Run these as the database superuser

-- Update statistics
ANALYZE;

-- Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at_desc ON jobs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_job_swipes_user_created ON user_job_swipes(user_id, created_at DESC);

-- Enable query planning optimization
SET enable_seqscan = off;
SET random_page_cost = 1.1;
SET effective_io_concurrency = 200;
```

### Redis Performance Tuning

```bash
# Redis performance optimization
# Add to redis.conf

# Memory optimization
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Network optimization
tcp-keepalive 300
tcp-backlog 511

# Persistence optimization
save 900 1
save 300 10
save 60 10000
```

---

## Troubleshooting

### Common Service Issues

#### PostgreSQL Issues

```bash
# Check PostgreSQL status
pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER

# Check connection pool
psql $DATABASE_URL -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"

# Check slow queries
psql $DATABASE_URL -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

#### Redis Issues

```bash
# Check Redis status
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping

# Check Redis memory usage
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD info memory

# Check slow queries
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD slowlog get 10
```

#### S3 Issues

```bash
# Test S3 connectivity
aws s3 ls s3://jobswipe-files-prod/

# Check S3 permissions
aws s3api get-bucket-policy --bucket jobswipe-files-prod

# Test file upload
echo "test" | aws s3 cp - s3://jobswipe-files-prod/test.txt
aws s3 rm s3://jobswipe-files-prod/test.txt
```

---

*This services setup guide is maintained by the JobSwipe team. Last updated: January 2024*