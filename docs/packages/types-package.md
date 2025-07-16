# @jobswipe/types Package

## Purpose

The `@jobswipe/types` package is the foundation of the JobSwipe type system. It provides global TypeScript types, interfaces, and utility types that are used across all applications and packages in the monorepo.

## Why This Package Exists

### 1. **Type Consistency**
- All apps and packages use the same type definitions
- Prevents type mismatches between frontend and backend
- Ensures data structures are consistent across the platform

### 2. **Developer Experience**
- Provides excellent IDE support with autocompletion
- Catches errors at compile time rather than runtime
- Makes refactoring safer and easier

### 3. **API Contract**
- Defines the shape of data that flows between applications
- Serves as documentation for data structures
- Ensures frontend and backend stay in sync

## Key Type Categories

### 1. **Utility Types**
Advanced TypeScript utilities for type manipulation:

**DeepPartial & DeepRequired**
- Makes all properties optional or required recursively
- Useful for partial updates and form handling

**Optional & RequiredFields**
- Makes specific properties optional or required
- Helpful for API endpoints with different requirements

**Brand Types**
- Creates branded types for type safety
- Prevents mixing different types of IDs
- Example: `UserId` vs `JobId` are both strings but different types

### 2. **Environment Types**
Application environment and configuration types:

**Environment**
- Development, staging, production, test environments
- Used by configuration management

**LogLevel**
- Debug, info, warn, error levels
- Used for logging configuration

**HttpMethod**
- GET, POST, PUT, DELETE, etc.
- Used for API routing and client requests

### 3. **API Types**
Types for API communication:

**ApiResponse**
- Standard response wrapper for all API calls
- Includes success status, data, error messages, timestamps

**ApiError**
- Standardized error structure
- Includes error codes, messages, and debugging information

**PaginatedResponse**
- Standard pagination structure
- Includes data array and pagination metadata

### 4. **Data Structure Types**
Common data structures used throughout the application:

**PaginationParams & PaginationMeta**
- Handles pagination for lists and tables
- Includes page numbers, limits, totals, cursors

**SortParam & FilterParam**
- Handles sorting and filtering for data tables
- Supports multiple sort fields and complex filters

**SearchParams**
- Combines query, filters, sorting, and pagination
- Used for complex search operations

### 5. **Date and Time Types**
Time-related types and utilities:

**DateRange**
- Represents date ranges for filtering
- Used in reports and analytics

**TimePeriod**
- Standard time periods (hour, day, week, month, etc.)
- Used for scheduling and reporting

**TimezoneInfo**
- Timezone information for internationalization
- Handles user timezone preferences

### 6. **File and Media Types**
File handling and media types:

**FileInfo**
- Metadata for uploaded files
- Includes size, type, URL, creation date

**ImageInfo**
- Extended file info for images
- Includes dimensions, aspect ratio, thumbnails

**FileUploadConfig**
- Configuration for file uploads
- Includes size limits, allowed types, destinations

### 7. **Notification Types**
Notification system types:

**NotificationPriority**
- Low, normal, high, urgent, critical levels
- Used for notification routing and display

**NotificationChannel**
- Email, SMS, push, in-app, Slack, webhook channels
- Supports multiple notification methods

**NotificationType**
- Info, success, warning, error, job match, etc.
- Categorizes different types of notifications

### 8. **Health and Monitoring Types**
System health and monitoring:

**HealthStatus**
- Healthy, degraded, unhealthy, unknown states
- Used for service monitoring

**ServiceHealth**
- Health information for individual services
- Includes uptime, response time, dependencies

**ApplicationHealth**
- Overall application health
- Includes system metrics and service statuses

### 9. **Cache and Performance Types**
Caching and performance optimization:

**CacheConfig**
- Configuration for caching systems
- Includes TTL, strategies, compression settings

**CacheEntry**
- Individual cache entry metadata
- Includes keys, values, expiration, hit counts

**CacheStats**
- Cache performance statistics
- Includes hit rates, memory usage, size

### 10. **Queue and Job Types**
Background job processing:

**JobStatus**
- Pending, processing, completed, failed, cancelled
- Tracks job lifecycle states

**JobPriority**
- Low, normal, high, critical priorities
- Used for job scheduling and processing

**QueueJob**
- Job definition with data, status, attempts
- Used by the queue system

### 11. **WebSocket Types**
Real-time communication:

**WebSocketMessageType**
- Message types for WebSocket communication
- Includes ping, pong, subscribe, data, error

**WebSocketConnection**
- Connection metadata and state
- Includes user info, channels, activity

## How Other Packages Use This Package

### @jobswipe/utils
- Uses utility types for function parameters
- Implements validation functions using these types
- Provides type-safe utility functions

### @jobswipe/config
- Uses Environment and LogLevel types
- Implements configuration validation using these types
- Provides typed configuration objects

### @jobswipe/database
- Uses data structure types for database operations
- Implements typed database queries and mutations
- Provides type-safe database utilities

### @jobswipe/shared
- Uses authentication and API types
- Implements business logic with proper typing
- Provides type-safe service implementations

## Integration with Applications

### Web Application
- Uses API types for frontend-backend communication
- Implements forms with proper type validation
- Uses pagination and filtering types for data tables

### Desktop Application
- Uses the same types for consistent data handling
- Implements WebSocket communication with proper typing
- Uses file and media types for file handling

### API Server
- Uses API types for request/response handling
- Implements endpoints with proper type validation
- Uses queue and job types for background processing

## Key Benefits

### 1. **Type Safety**
- Prevents runtime errors through compile-time checking
- Ensures data consistency across all applications
- Catches integration issues early in development

### 2. **Developer Productivity**
- Excellent IDE support with autocompletion
- Self-documenting code through types
- Easier refactoring and maintenance

### 3. **API Documentation**
- Types serve as living documentation
- Always up-to-date with the actual implementation
- Helps with frontend-backend collaboration

### 4. **Quality Assurance**
- Reduces bugs through type checking
- Ensures consistent error handling
- Prevents data structure mismatches

## Maintenance and Evolution

### Adding New Types
- New types are added to appropriate categories
- Exported through the main index.ts file
- Available immediately to all packages and applications

### Versioning
- Types evolve with the application
- Breaking changes are coordinated across all packages
- Backward compatibility is maintained when possible

### Testing
- Types are tested through usage in other packages
- Compile-time verification ensures correctness
- Integration tests validate type compatibility

## Best Practices

### 1. **Naming Conventions**
- Use descriptive names that indicate purpose
- Follow TypeScript naming conventions
- Use consistent prefixes for related types

### 2. **Type Organization**
- Group related types together
- Use clear section headers and documentation
- Export everything through the main index file

### 3. **Documentation**
- Include JSDoc comments for complex types
- Provide examples in documentation
- Explain the purpose and use cases

### 4. **Evolution Strategy**
- Add new types without breaking existing ones
- Deprecate old types gradually
- Communicate changes to all package maintainers

This package is the foundation that makes the entire JobSwipe monorepo type-safe and maintainable. Every other package depends on it, making it one of the most critical components of the system.