# 🚀 JobSwipe API - DigitalOcean Deployment Guide

## 📋 Prerequisites

### 1. DigitalOcean Account Setup
- Create a DigitalOcean account
- Set up a Droplet (Ubuntu 22.04 LTS, minimum 2GB RAM)
- Configure a domain name pointing to your droplet's IP

### 2. Required DigitalOcean Services
- **Managed Database**: PostgreSQL 15+
- **Managed Redis**: For caching and sessions
- **Droplet**: Ubuntu 22.04, 2GB RAM minimum
- **Domain**: Optional but recommended for production

## 🛠️ Server Setup

### 1. Initial Server Configuration

```bash
# Connect to your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deployment user
adduser deploy
usermod -aG docker deploy
su - deploy
```

### 2. Clone Repository

```bash
# Clone your repository
git clone https://github.com/Abransh/jobswipe.git
cd jobswipe/apps/api/deploy

# Copy environment template
cp .env.production .env
```

### 3. Configure Environment Variables

Edit the `.env` file with your actual values:

```bash
nano .env
```

**Required Configuration:**

```env
# Database (DigitalOcean Managed Database)
DATABASE_URL=postgresql://username:password@db-host:25060/jobswipe?sslmode=require

# Redis (DigitalOcean Managed Redis)
REDIS_URL=redis://default:password@redis-host:25061

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your_super_secret_jwt_key_here_64_chars_minimum
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_64_chars_minimum

# Domain Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### 4. SSL Certificate Setup (Optional)

```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to deploy folder
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
sudo chown -R deploy:deploy ssl/
```

## 🚀 Deployment

### Option 1: Quick Deployment (Recommended)

```bash
# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Verification

### 1. Health Checks

```bash
# Test API health
curl http://localhost:3001/health

# Test specific endpoints
curl http://localhost:3001/api/v1/info
```

### 2. Monitor Logs

```bash
# Follow API logs
docker-compose -f docker-compose.prod.yml logs -f jobswipe-api

# Check nginx logs (if using)
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## 🛡️ Security Considerations

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow API port (if not using nginx)
sudo ufw allow 3001
```

### 2. Environment Security

- Store sensitive environment variables securely
- Use strong, unique passwords for database and Redis
- Regular security updates for the droplet
- Enable 2FA on DigitalOcean account

## 📊 Monitoring & Maintenance

### 1. Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs --tail=100 jobswipe-api

# Monitor resource usage
docker stats
```

### 2. Updates & Maintenance

```bash
# Update application
git pull origin main
./deploy.sh

# Database backups (automatic with DigitalOcean Managed Database)
# Set up automated backups in DigitalOcean control panel
```

### 3. Health Monitoring

Set up monitoring alerts in DigitalOcean for:
- Droplet CPU/Memory usage
- Database connections
- API response times

## 🐛 Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs jobswipe-api

   # Check environment variables
   docker-compose -f docker-compose.prod.yml config
   ```

2. **Database connection issues**
   ```bash
   # Test database connectivity
   docker exec -it jobswipe-api node -e "console.log(process.env.DATABASE_URL)"
   ```

3. **SSL certificate issues**
   ```bash
   # Renew certificates
   sudo certbot renew

   # Restart nginx
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

## 📱 API Endpoints

Once deployed, your API will have the following endpoints:

### Health & Status
- `GET /health` - Basic health check
- `GET /ready` - Kubernetes readiness probe
- `GET /live` - Kubernetes liveness probe
- `GET /api/v1/info` - API information

### Authentication (Placeholder)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Enterprise Features
- `GET /metrics` - Application metrics
- `GET /security/csrf-token` - CSRF token
- `GET /health/detailed` - Detailed health status

## 🔗 URLs

After successful deployment:

- **API Base URL**: `https://yourdomain.com` (or `http://your-droplet-ip:3001`)
- **Health Check**: `https://yourdomain.com/health`
- **API Info**: `https://yourdomain.com/api/v1/info`

## 💡 Next Steps

1. Set up automated backups
2. Configure monitoring and alerting
3. Set up CI/CD pipeline
4. Implement proper logging aggregation
5. Scale horizontally with load balancers if needed

---

For support or questions, check the logs first, then refer to the main project documentation.