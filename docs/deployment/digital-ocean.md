# JobSwipe API Deployment Guide - Digital Ocean

## Overview

This guide provides step-by-step instructions for deploying the JobSwipe API on Digital Ocean infrastructure. The deployment covers the API server, PostgreSQL database, Redis cache, and supporting services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Setup (PostgreSQL)](#database-setup-postgresql)
4. [Redis Setup](#redis-setup)
5. [API Deployment](#api-deployment)
6. [Domain & SSL Configuration](#domain--ssl-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Environment Variables](#environment-variables)
9. [Backup & Recovery](#backup--recovery)
10. [Scaling Considerations](#scaling-considerations)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Credits
- Digital Ocean account with credits
- Domain name (optional but recommended)
- GitHub account for code repository

### Local Tools Required
```bash
# Install doctl (Digital Ocean CLI)
brew install doctl

# Install Docker
brew install docker

# Install Node.js 20 LTS
brew install node@20

# Install pnpm
npm install -g pnpm
```

### Initial Digital Ocean Setup
```bash
# Authenticate with Digital Ocean
doctl auth init

# Verify authentication
doctl account get

# Create SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Add SSH key to Digital Ocean
doctl compute ssh-key import jobswipe-key --public-key-file ~/.ssh/id_rsa.pub
```

---

## Infrastructure Setup

### 1. Create Droplet (Virtual Machine)

**Option A: Using Digital Ocean Web Interface**
1. Go to [Digital Ocean Console](https://cloud.digitalocean.com)
2. Click "Create" → "Droplet"
3. Select Configuration:
   - **Distribution**: Ubuntu 24.04 LTS
   - **Plan**: Basic
   - **CPU Options**: Regular with SSD
   - **Size**: $12/month (2 GB RAM, 1 vCPU, 50 GB SSD)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (select your key)
   - **Hostname**: `jobswipe-api-prod`
   - **Tags**: `jobswipe`, `production`, `api`

**Option B: Using CLI**
```bash
# Create droplet
doctl compute droplet create jobswipe-api-prod \
  --image ubuntu-24-04-x64 \
  --size s-2vcpu-2gb \
  --region nyc1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
  --tag-names jobswipe,production,api \
  --wait

# Get droplet IP
doctl compute droplet list jobswipe-api-prod
```

### 2. Initial Server Setup

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Create non-root user
adduser jobswipe
usermod -aG sudo jobswipe

# Copy SSH keys to new user
rsync --archive --chown=jobswipe:jobswipe ~/.ssh /home/jobswipe

# Switch to jobswipe user
su - jobswipe
```

### 3. Install Node.js and pnpm

```bash
# Install Node.js 20 LTS using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Verify installations
node --version  # Should be v20.x.x
pnpm --version
```

### 4. Install Docker

```bash
# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker jobswipe

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
docker compose version
```

---

## Database Setup (PostgreSQL)

### Option A: Digital Ocean Managed Database (Recommended)

**Using Web Interface:**
1. Go to Digital Ocean Console → Databases
2. Click "Create Database"
3. Configure:
   - **Engine**: PostgreSQL 16
   - **Plan**: Basic ($15/month, 1 GB RAM, 1 vCPU, 10 GB storage)
   - **Datacenter Region**: Same as your droplet
   - **Database Name**: `jobswipe`
   - **Tags**: `jobswipe`, `production`

**Using CLI:**
```bash
# Create managed PostgreSQL database
doctl databases create jobswipe-db \
  --engine pg \
  --version 16 \
  --size db-s-1vcpu-1gb \
  --region nyc1 \
  --num-nodes 1

# Get connection details
doctl databases connection jobswipe-db
```

**Database Configuration:**
```bash
# Connect to database and create user
psql "postgresql://doadmin:PASSWORD@HOST:PORT/defaultdb?sslmode=require"

-- Create application database and user
CREATE DATABASE jobswipe;
CREATE USER jobswipe_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE jobswipe TO jobswipe_user;

-- Enable required extensions
\c jobswipe;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Option B: Self-Hosted PostgreSQL

```bash
# Create docker-compose.yml for PostgreSQL
mkdir -p ~/jobswipe/database
cd ~/jobswipe/database

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
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - jobswipe-network

volumes:
  postgres_data:

networks:
  jobswipe-network:
    external: true
EOF

# Create init script
cat > init.sql << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOF

# Create environment file
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)" > .env

# Start PostgreSQL
docker network create jobswipe-network
docker compose up -d

# Verify PostgreSQL is running
docker compose ps
```

---

## Redis Setup

### Option A: Digital Ocean Managed Redis (Recommended)

**Using Web Interface:**
1. Go to Digital Ocean Console → Databases
2. Click "Create Database"
3. Configure:
   - **Engine**: Redis 7
   - **Plan**: Basic ($15/month)
   - **Datacenter Region**: Same as your droplet
   - **Tags**: `jobswipe`, `production`

**Using CLI:**
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
```

### Option B: Self-Hosted Redis

```bash
# Create Redis configuration
mkdir -p ~/jobswipe/redis
cd ~/jobswipe/redis

cat > redis.conf << 'EOF'
bind 127.0.0.1
port 6379
requirepass your-redis-password
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF

# Create docker-compose.yml for Redis
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

volumes:
  redis_data:

networks:
  jobswipe-network:
    external: true
EOF

# Start Redis
docker compose up -d

# Test Redis connection
docker exec -it jobswipe-redis redis-cli ping
```

---

## API Deployment

### 1. Deploy Application Code

```bash
# Create application directory
mkdir -p ~/jobswipe/api
cd ~/jobswipe/api

# Clone your repository (replace with your repo URL)
git clone https://github.com/your-username/jobswipe.git .

# Install dependencies
cd apps/api
pnpm install

# Build the application
pnpm run build

# Create systemd service
sudo tee /etc/systemd/system/jobswipe-api.service << 'EOF'
[Unit]
Description=JobSwipe API Server
After=network.target

[Service]
Type=simple
User=jobswipe
WorkingDirectory=/home/jobswipe/jobswipe/apps/api
Environment=NODE_ENV=production
EnvironmentFile=/home/jobswipe/jobswipe/apps/api/.env.production
ExecStart=/usr/bin/node dist/minimal-index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable jobswipe-api
sudo systemctl start jobswipe-api

# Check service status
sudo systemctl status jobswipe-api
```

### 2. Environment Configuration

```bash
# Create production environment file
cd ~/jobswipe/apps/api

cat > .env.production << 'EOF'
# Server Configuration
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0
API_PREFIX=/api/v1

# Database Configuration (replace with your credentials)
DATABASE_URL="postgresql://jobswipe_user:PASSWORD@HOST:PORT/jobswipe?sslmode=require"

# Redis Configuration (replace with your credentials)
REDIS_URL="redis://:PASSWORD@HOST:PORT"
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# Security Configuration
CSRF_SECRET=$(openssl rand -base64 32)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# CORS Configuration
API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Logging Configuration
LOG_LEVEL=info
LOG_STRUCTURED=true

# Monitoring Configuration
MONITORING_ENABLED=true
ALERTING_ENABLED=true
EOF

# Secure the environment file
chmod 600 .env.production
```

### 3. Database Migration

```bash
# Run Prisma migrations
cd ~/jobswipe/apps/api
pnpm run db:migrate

# Seed initial data (if you have seed scripts)
pnpm run db:seed
```

### 4. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/jobswipe-api << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # API proxy
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (no rate limiting)
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/jobswipe-api /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Domain & SSL Configuration

### 1. Point Domain to Server

Add these DNS records to your domain:
```
Type: A
Name: @
Value: YOUR_DROPLET_IP

Type: A  
Name: www
Value: YOUR_DROPLET_IP

Type: CNAME
Name: api
Value: your-domain.com
```

### 2. Install SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Setup automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Monitoring & Logging

### 1. Setup Log Rotation

```bash
# Create log rotation configuration
sudo tee /etc/logrotate.d/jobswipe-api << 'EOF'
/var/log/jobswipe-api/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 jobswipe jobswipe
    postrotate
        systemctl reload jobswipe-api
    endscript
}
EOF
```

### 2. Setup Basic Monitoring

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Create monitoring script
mkdir -p ~/scripts
cat > ~/scripts/monitor.sh << 'EOF'
#!/bin/bash

# Check if API is responding
if ! curl -f -s http://localhost:3001/health > /dev/null; then
    echo "$(date): API health check failed" >> /var/log/jobswipe-monitor.log
    sudo systemctl restart jobswipe-api
fi

# Check disk space
DISK_USAGE=$(df / | grep -vE '^Filesystem|tmpfs|cdrom' | awk '{ print $5 }' | sed 's/%//g')
if [ $DISK_USAGE -gt 85 ]; then
    echo "$(date): Disk usage is ${DISK_USAGE}%" >> /var/log/jobswipe-monitor.log
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "$(date): Memory usage is ${MEMORY_USAGE}%" >> /var/log/jobswipe-monitor.log
fi
EOF

chmod +x ~/scripts/monitor.sh

# Add to crontab
crontab -e
# Add this line:
*/5 * * * * /home/jobswipe/scripts/monitor.sh
```

---

## Environment Variables

### Complete Environment Variables Reference

```bash
# Server Configuration
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0
API_PREFIX=/api/v1

# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Redis Configuration
REDIS_URL="redis://:password@host:port"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX="jobswipe:"

# JWT Configuration
JWT_SECRET=your-jwt-secret-64-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-64-characters-long
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800
JWT_KEY_ROTATION_INTERVAL=86400000

# Security Configuration
CSRF_ENABLED=true
CSRF_SECRET=your-csrf-secret-32-characters
CSP_ENABLED=true
ATTACK_DETECTION_ENABLED=true
RATE_LIMITING_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# CORS Configuration
API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Logging Configuration
LOG_LEVEL=info
LOG_STRUCTURED=true
AUDIT_LOGGING_ENABLED=true
PERFORMANCE_LOGGING_ENABLED=true
ERROR_INCLUDE_STACK_TRACE=false

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000
ALERTING_ENABLED=true
ALERT_WEBHOOK_URL=https://your-webhook-url.com
ALERT_ERROR_RATE_THRESHOLD=0.05
ALERT_RESPONSE_TIME_THRESHOLD=2000
ALERT_MEMORY_THRESHOLD=85
ALERT_CPU_THRESHOLD=80

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt

# Email Configuration (if using email services)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@yourdomain.com

# AWS Configuration (if using S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

---

## Backup & Recovery

### 1. Database Backup

```bash
# Create backup script
mkdir -p ~/backups
cat > ~/scripts/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/jobswipe/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="jobswipe_backup_${DATE}.sql"

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 backups
find $BACKUP_DIR -name "jobswipe_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF

chmod +x ~/scripts/backup-db.sh

# Schedule daily backups
crontab -e
# Add this line:
0 2 * * * /home/jobswipe/scripts/backup-db.sh
```

### 2. File System Backup

```bash
# Create application backup script
cat > ~/scripts/backup-app.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/jobswipe/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_BACKUP="jobswipe_app_backup_${DATE}.tar.gz"

# Backup application files
tar -czf "$BACKUP_DIR/$APP_BACKUP" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    /home/jobswipe/jobswipe/

# Keep only last 3 app backups
find $BACKUP_DIR -name "jobswipe_app_backup_*.tar.gz" -mtime +3 -delete

echo "App backup completed: $APP_BACKUP"
EOF

chmod +x ~/scripts/backup-app.sh
```

### 3. Restore Procedures

```bash
# Database restore
gunzip jobswipe_backup_YYYYMMDD_HHMMSS.sql.gz
psql $DATABASE_URL < jobswipe_backup_YYYYMMDD_HHMMSS.sql

# Application restore
tar -xzf jobswipe_app_backup_YYYYMMDD_HHMMSS.tar.gz -C /
```

---

## Scaling Considerations

### 1. Vertical Scaling (Upgrade Droplet)

```bash
# Using CLI to resize droplet
doctl compute droplet-action resize jobswipe-api-prod --size s-4vcpu-8gb --resize-disk
```

### 2. Horizontal Scaling (Load Balancer)

```bash
# Create load balancer
doctl compute load-balancer create \
  --name jobswipe-lb \
  --forwarding-rules entry_protocol:https,entry_port:443,target_protocol:http,target_port:3001,certificate_id:your-cert-id \
  --health-check protocol:http,port:3001,path:/health,check_interval_seconds:10,response_timeout_seconds:5,unhealthy_threshold:3,healthy_threshold:5 \
  --droplet-ids droplet-id-1,droplet-id-2 \
  --region nyc1
```

### 3. Database Scaling

```bash
# Upgrade managed database
doctl databases resize jobswipe-db --size db-s-2vcpu-4gb --num-nodes 1
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. API Not Starting

```bash
# Check service status
sudo systemctl status jobswipe-api

# Check logs
sudo journalctl -u jobswipe-api -f

# Check if port is in use
sudo netstat -tlnp | grep 3001

# Restart service
sudo systemctl restart jobswipe-api
```

#### 2. Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check if database is accessible
telnet your-db-host 5432

# Verify environment variables
cat /home/jobswipe/jobswipe/apps/api/.env.production
```

#### 3. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. High Memory Usage

```bash
# Check memory usage
free -h
htop

# Check Node.js memory usage
ps aux | grep node

# Restart API service
sudo systemctl restart jobswipe-api
```

#### 5. Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up logs
sudo journalctl --vacuum-time=7d

# Clean up old backups
find ~/backups -mtime +7 -delete

# Clean npm cache
npm cache clean --force
```

### Debugging Commands

```bash
# Real-time logs
sudo journalctl -u jobswipe-api -f

# Check all running services
sudo systemctl list-units --type=service --state=running

# Monitor system resources
htop
iotop
nethogs

# Check network connections
sudo netstat -tlnp

# Test API endpoints
curl -I http://localhost:3001/health
curl -I https://your-domain.com/health

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

## Performance Optimization

### 1. Node.js Optimization

```bash
# Add to .env.production
NODE_OPTIONS="--max-old-space-size=2048"
UV_THREADPOOL_SIZE=16
```

### 2. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX CONCURRENTLY idx_applications_user_id ON applications(user_id);
CREATE INDEX CONCURRENTLY idx_applications_status ON applications(status);
```

### 3. Nginx Optimization

```nginx
# Add to Nginx configuration
client_max_body_size 10M;
client_body_timeout 60s;
client_header_timeout 60s;
keepalive_timeout 65s;
send_timeout 60s;

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types application/json application/javascript text/css text/xml application/xml;
```

---

## Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (only allow SSH, HTTP, HTTPS)
- [ ] SSH key authentication (password auth disabled)
- [ ] Regular security updates scheduled
- [ ] Database credentials secured
- [ ] Environment variables properly protected
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Log monitoring in place
- [ ] Backup system working
- [ ] Monitoring and alerting configured

---

## Cost Estimation

### Monthly Costs (Digital Ocean)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Droplet (API Server) | 2GB RAM, 1 vCPU | $12 |
| Managed PostgreSQL | 1GB RAM, 1 vCPU | $15 |
| Managed Redis | 1GB RAM | $15 |
| Load Balancer (optional) | Standard | $12 |
| Backup Storage | 20GB | $2 |
| **Total** | | **$56/month** |

### Cost Optimization Tips

1. Start with smaller instances and scale as needed
2. Use self-hosted databases initially to reduce costs
3. Implement proper caching to reduce database load
4. Monitor usage and optimize resource allocation
5. Use reserved instances for predictable workloads

---

## Support & Resources

- [Digital Ocean Documentation](https://docs.digitalocean.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

*This deployment guide is maintained by the JobSwipe team. Last updated: January 2024*