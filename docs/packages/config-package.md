# @jobswipe/config Package

## Purpose

The `@jobswipe/config` package manages all environment configuration, application settings, and runtime configuration for the JobSwipe platform. It provides a centralized, type-safe way to handle configuration across all applications and environments.

## Why This Package Exists

### 1. **Centralized Configuration**
- Single source of truth for all configuration
- Consistent configuration across all applications
- Prevents configuration drift and inconsistencies

### 2. **Environment Management**
- Different settings for development, staging, and production
- Environment-specific feature flags and settings
- Secure handling of sensitive configuration

### 3. **Type Safety**
- Validated configuration with Zod schemas
- Compile-time checking of configuration usage
- Prevents runtime errors from invalid configuration

### 4. **Developer Experience**
- Clear configuration structure and documentation
- Easy to add new configuration options
- Runtime validation with helpful error messages

## Configuration Categories

### 1. **Application Configuration**
Core application settings and metadata:

**Basic Settings**
- Application name and version
- Environment (development, staging, production, test)
- Server port and host configuration
- Base URL for the application

**Feature Flags**
- Enable/disable features per environment
- A/B testing configuration
- Gradual rollout settings
- Debug and development flags

**Logging Configuration**
- Log levels (debug, info, warn, error)
- Log output destinations
- Performance metrics enablement
- Request/response logging settings

### 2. **Database Configuration**
PostgreSQL database connection and settings:

**Connection Settings**
- Database host and port
- Database name and credentials
- SSL configuration
- Connection timeouts and retries

**Connection Pooling**
- Maximum number of connections
- Connection timeout settings
- Idle connection timeout
- Connection health checking

**Performance Settings**
- Query timeout configuration
- Connection pool sizing
- Statement caching settings
- Performance monitoring options

### 3. **Redis Configuration**
Redis connection and caching settings:

**Connection Settings**
- Redis host and port
- Authentication credentials
- Database selection
- Connection timeouts

**Reliability Settings**
- Maximum retry attempts
- Retry delay configuration
- Failover handling
- Lazy connection establishment

**Performance Settings**
- Connection pooling
- Command pipelining
- Memory usage optimization
- Cluster configuration

### 4. **JWT Configuration**
JSON Web Token settings for authentication:

**Cryptographic Settings**
- Private and public key configuration
- Signing algorithm (RS256)
- Key rotation settings
- Token issuer and audience

**Token Lifetimes**
- Access token expiration (15 minutes)
- Refresh token expiration (30 days)
- Desktop token expiration (90 days)
- Verification token expiration (24 hours)

**Security Settings**
- Token validation rules
- Blacklist management
- Session binding
- Device fingerprinting

### 5. **CORS Configuration**
Cross-Origin Resource Sharing settings:

**Origin Configuration**
- Allowed origins for web requests
- Dynamic origin validation
- Wildcard and subdomain support
- Development vs production origins

**Request Configuration**
- Allowed HTTP methods
- Allowed request headers
- Credential handling
- Preflight cache duration

**Security Settings**
- Origin validation rules
- Header sanitization
- Request size limits
- Rate limiting integration

### 6. **Rate Limiting Configuration**
Request rate limiting and throttling:

**Global Rate Limits**
- Requests per time window
- Burst allowance
- IP-based limiting
- User-based limiting

**Endpoint-Specific Limits**
- Authentication endpoint limits
- API endpoint limits
- Upload endpoint limits
- Search endpoint limits

**Behavior Configuration**
- Skip successful requests
- Skip failed requests
- Custom key generation
- Sliding window vs fixed window

### 7. **Email Configuration**
Email service settings for notifications:

**Provider Configuration**
- Email service provider (SMTP, SES, SendGrid)
- Authentication credentials
- Server settings and ports
- SSL/TLS configuration

**Message Configuration**
- From address and reply-to
- Default templates
- Retry configuration
- Bounce handling

**Delivery Settings**
- Queue configuration
- Batch sending
- Rate limiting
- Monitoring and logging

### 8. **File Storage Configuration**
File upload and storage settings:

**Storage Provider**
- Local file system
- AWS S3 configuration
- Google Cloud Storage
- Azure Blob Storage

**Upload Configuration**
- Maximum file sizes
- Allowed file types
- Upload destinations
- Temporary file handling

**Security Settings**
- File scanning and validation
- Access controls
- Encryption settings
- Backup and replication

## Configuration Loading

### Environment Variables
Configuration is loaded from environment variables:

**Required Variables**
- Database connection strings
- JWT signing keys
- Redis connection details
- External service credentials

**Optional Variables**
- Feature flags and toggles
- Performance tuning settings
- Debug and logging options
- Development overrides

**Validation Process**
- Zod schema validation for all configuration
- Type checking at runtime
- Clear error messages for invalid configuration
- Graceful fallbacks where appropriate

### Configuration Hierarchy
Configuration is loaded in order of precedence:

1. **Environment Variables** (highest priority)
2. **Configuration Files** (environment-specific)
3. **Default Values** (lowest priority)

### Environment-Specific Configuration
Different settings for each environment:

**Development Environment**
- Detailed logging enabled
- Debug features enabled
- Relaxed security settings
- Local service connections

**Staging Environment**
- Production-like settings
- Limited debug features
- Moderate security settings
- Staging service connections

**Production Environment**
- Minimal logging
- All security features enabled
- Optimized performance settings
- Production service connections

## Configuration Utilities

### Environment Detection
Utility functions for environment-specific logic:

**Environment Checks**
- `isDevelopment()` - Check if in development
- `isProduction()` - Check if in production
- `isTest()` - Check if in test environment
- `isStaging()` - Check if in staging environment

### Configuration Access
Safe configuration access functions:

**Required Configuration**
- `getRequiredEnvVar()` - Get required environment variable
- Throws error if variable is missing
- Used for critical configuration

**Optional Configuration**
- `getOptionalEnvVar()` - Get optional environment variable
- Returns default value if missing
- Used for optional settings

**Typed Configuration**
- `getBooleanEnvVar()` - Get boolean environment variable
- `getNumberEnvVar()` - Get number environment variable
- Type-safe configuration access

### Configuration Validation
Validation functions for configuration integrity:

**Schema Validation**
- `validateConfig()` - Validate entire configuration
- Uses Zod schemas for validation
- Provides detailed error messages

**Runtime Validation**
- Configuration validated at application startup
- Invalid configuration prevents application start
- Clear error messages for debugging

## How Other Packages Use This Package

### @jobswipe/database
- Uses database configuration for connection
- Uses connection pooling settings
- Uses performance optimization settings
- Uses security and encryption settings

### @jobswipe/shared
- Uses JWT configuration for token management
- Uses Redis configuration for sessions
- Uses email configuration for notifications
- Uses security settings for authentication

### Applications
- Load configuration at startup
- Use environment-specific settings
- Apply feature flags and toggles
- Configure logging and monitoring

## Integration with Applications

### Web Application
- Uses CORS configuration for browser requests
- Uses JWT configuration for authentication
- Uses rate limiting for API protection
- Uses logging configuration for monitoring

### Desktop Application
- Uses JWT configuration for authentication
- Uses file storage for temporary files
- Uses logging configuration for debugging
- Uses performance settings for optimization

### API Server
- Uses all configuration categories
- Central configuration management
- Environment-specific behavior
- Security and performance settings

## Key Benefits

### 1. **Type Safety**
- Compile-time checking of configuration usage
- Runtime validation with Zod schemas
- Prevents configuration-related runtime errors
- Clear error messages for debugging

### 2. **Environment Management**
- Easy switching between environments
- Environment-specific feature flags
- Secure handling of sensitive data
- Consistent behavior across environments

### 3. **Developer Experience**
- Clear configuration structure
- Comprehensive documentation
- Easy to add new configuration options
- IDE support with autocompletion

### 4. **Security**
- Secure handling of sensitive configuration
- Validation of security-critical settings
- Prevention of configuration leaks
- Audit trail for configuration changes

## Best Practices

### 1. **Configuration Security**
- Never commit sensitive configuration to version control
- Use environment variables for secrets
- Validate all configuration at startup
- Implement proper access controls

### 2. **Environment Separation**
- Use different configuration for each environment
- Implement proper environment detection
- Use feature flags for environment-specific behavior
- Test configuration in each environment

### 3. **Validation and Error Handling**
- Validate all configuration with schemas
- Provide clear error messages
- Fail fast on invalid configuration
- Log configuration loading and validation

### 4. **Documentation**
- Document all configuration options
- Provide examples for each setting
- Explain the purpose of each configuration
- Keep documentation up-to-date

## Maintenance and Evolution

### Adding New Configuration
- Define Zod schema for validation
- Add environment variable mapping
- Update configuration interface
- Add documentation and examples

### Configuration Migration
- Handle configuration changes gracefully
- Provide migration path for breaking changes
- Maintain backward compatibility where possible
- Document migration steps

### Security Updates
- Regular review of security settings
- Update default values as needed
- Implement new security requirements
- Audit configuration access patterns

The config package is critical for maintaining a secure, scalable, and manageable configuration system across the JobSwipe platform. It ensures that all applications have consistent, validated, and environment-appropriate configuration.