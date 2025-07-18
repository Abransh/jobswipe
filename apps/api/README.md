# JobSwipe API Server

Enterprise-grade API server built with Fastify and TypeScript for the JobSwipe job application automation platform.

## Features

- 🚀 **High Performance**: Built with Fastify for maximum throughput
- 🔒 **Enterprise Security**: CSRF protection, rate limiting, input validation
- 📊 **Monitoring & Logging**: Comprehensive observability and audit trails
- 🗄️ **Database Integration**: PostgreSQL with Prisma ORM
- ⚡ **Caching**: Redis for session management and performance
- 🔑 **Authentication**: JWT-based auth with refresh tokens
- 📁 **File Storage**: AWS S3 integration for file uploads
- 🐳 **Production Ready**: Docker support and deployment guides

## Quick Start

### Prerequisites

- Node.js 20 LTS
- pnpm
- PostgreSQL (local or managed)
- Redis (local or managed)

### Development Setup

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.development

# Start development server
pnpm run dev:minimal

# The server will be available at http://localhost:3001
```

### Production Build

```bash
# Build for production
pnpm run build:production

# Start production server
pnpm run start:production
```

## Available Scripts

### Development

```bash
pnpm run dev:minimal      # Start development server with hot reload
pnpm run type-check       # Check TypeScript types
pnpm run lint             # Run ESLint
pnpm run lint:fix         # Fix ESLint issues
```

### Database

```bash
pnpm run db:generate      # Generate Prisma client
pnpm run db:migrate       # Run database migrations
pnpm run db:seed          # Seed database with test data
pnpm run db:studio        # Open Prisma Studio
pnpm run db:reset         # Reset database (development only)
```

### Production

```bash
pnpm run build:production # Build for production
pnpm run start:production # Start production server
pnpm run clean            # Clean build artifacts
```

### Testing

```bash
pnpm run test             # Run all tests (placeholder)
pnpm run test:unit        # Run unit tests (placeholder)
pnpm run test:integration # Run integration tests (placeholder)
```

## API Endpoints

### Health & Monitoring

```
GET  /health              # Basic health check
GET  /ready               # Kubernetes readiness probe
GET  /live                # Kubernetes liveness probe
GET  /health/detailed     # Detailed system health
GET  /metrics             # Application metrics
```

### Authentication

```
POST /api/v1/auth/login      # User login
POST /api/v1/auth/register   # User registration
POST /api/v1/auth/logout     # User logout
POST /api/v1/auth/refresh    # Refresh access token
GET  /api/v1/auth/profile    # Get user profile
```

### Security

```
GET  /security/csrf-token    # Get CSRF token
GET  /security/metrics       # Security metrics
GET  /security/health        # Security system health
```

## Environment Variables

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Redis (Optional - enables caching and sessions)
REDIS_URL="redis://user:password@host:port"

# JWT Secrets
JWT_SECRET="your-secure-jwt-secret"
JWT_REFRESH_SECRET="your-secure-refresh-secret"
```

### Optional Environment Variables

```bash
# CORS
API_CORS_ORIGIN="https://yourdomain.com"

# Rate Limiting
RATE_LIMITING_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=900000

# File Storage
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Email
EMAIL_SERVICE=ses
FROM_EMAIL=noreply@yourdomain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
MONITORING_ENABLED=true
ALERTING_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_STRUCTURED=true
AUDIT_LOGGING_ENABLED=true
```

## Architecture

### Core Components

- **Fastify Server**: High-performance HTTP server
- **Authentication**: JWT-based with refresh tokens
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for sessions and performance
- **Security**: CSRF, rate limiting, input validation
- **Monitoring**: Metrics collection and health checks
- **Logging**: Structured logging with correlation IDs

### Plugin Architecture

The API uses a modular plugin architecture:

- `services.plugin.ts`: Core services (JWT, Redis, Security)
- `logging.plugin.ts`: Centralized logging system
- `monitoring.plugin.ts`: Metrics and observability
- `advanced-security.plugin.ts`: Security and CSRF protection

### Database Schema

The API uses a comprehensive PostgreSQL schema with:

- User management and authentication
- Job postings and applications
- Resume storage and templates
- Subscription and billing
- Audit logs and metrics

## Deployment

### Digital Ocean Deployment

Follow the comprehensive deployment guide:
- [Digital Ocean Deployment Guide](../../docs/deployment/digital-ocean.md)
- [Services Setup Guide](../../docs/deployment/services-setup.md)

### Quick Deployment

1. **Setup Infrastructure**
   ```bash
   # Create droplet
   doctl compute droplet create jobswipe-api-prod \
     --image ubuntu-24-04-x64 \
     --size s-2vcpu-2gb \
     --region nyc1
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/jobswipe.git
   cd jobswipe/apps/api
   
   # Install dependencies
   pnpm install
   
   # Build for production
   pnpm run build:production
   
   # Start production server
   pnpm run start:production
   ```

3. **Setup Reverse Proxy**
   ```bash
   # Install and configure Nginx
   sudo apt install nginx
   # Configure reverse proxy (see deployment guide)
   ```

4. **Setup SSL**
   ```bash
   # Install Let's Encrypt certificate
   sudo certbot --nginx -d yourdomain.com
   ```

### Docker Deployment

```dockerfile
# Dockerfile (to be created)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build:production
EXPOSE 3001
CMD ["pnpm", "run", "start:production"]
```

## Monitoring

### Health Checks

The API provides comprehensive health checks:

- `/health`: Basic health status
- `/ready`: Kubernetes readiness probe
- `/live`: Kubernetes liveness probe
- `/health/detailed`: Detailed system health
- `/health/services`: Service health status

### Metrics

Application metrics are available at `/metrics`:

- Request metrics (count, duration, errors)
- System metrics (CPU, memory, uptime)
- Business metrics (users, applications)
- Security metrics (attacks blocked, rate limits)

### Logging

Structured logging with:

- Request/response logging
- Error tracking with stack traces
- Performance monitoring
- Security event logging
- Correlation ID tracking

## Security

### Security Features

- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: IP-based rate limiting
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **XSS Protection**: Input sanitization
- **Security Headers**: Comprehensive security headers

### Authentication

- JWT-based authentication
- Refresh token rotation
- Session management with Redis
- Password hashing with bcrypt
- Account lockout protection

### Data Protection

- Encryption at rest (database)
- Encryption in transit (HTTPS)
- PII data handling
- GDPR compliance features

## Performance

### Optimization

- Connection pooling for database
- Redis caching for sessions
- Compression for responses
- Static asset optimization
- Database query optimization

### Scaling

- Horizontal scaling with load balancers
- Database read replicas
- Redis clustering
- CDN for static assets

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Running Tests

```bash
# Run all tests
pnpm run test

# Run specific test suite
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e

# Watch mode for development
pnpm run test:watch
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   # Kill the process
   kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   # Check database status
   pg_isready -h localhost -p 5432
   # Check connection string
   echo $DATABASE_URL
   ```

3. **Redis connection failed**
   ```bash
   # Check Redis status
   redis-cli ping
   # Check connection string
   echo $REDIS_URL
   ```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug pnpm run dev:minimal

# Enable TypeScript debug
DEBUG=* pnpm run dev:minimal
```

### Performance Issues

```bash
# Check memory usage
node --inspect dist/minimal-index.js

# Profile performance
node --prof dist/minimal-index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Use Zod for input validation
- Add comprehensive error handling
- Write tests for new features
- Update documentation

## Support

- 📖 [Full Documentation](../../docs/)
- 🚀 [Deployment Guides](../../docs/deployment/)
- 🐛 [Issue Tracker](https://github.com/your-username/jobswipe/issues)
- 💬 [Discord Community](https://discord.gg/jobswipe)
- 📧 [Email Support](mailto:support@jobswipe.com)

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

---

Built with ❤️ by the JobSwipe team