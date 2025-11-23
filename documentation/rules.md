# SECTION 1: MANDATORY TECHNICAL STANDARDS
## TYPESCRIPT REQUIREMENTS:
- Use TypeScript strict mode everywhere
- Define interfaces for ALL data structures
- Use Zod for runtime validation on all API inputs
- Never use 'any' type - use proper typing
- Export types from dedicated types files
- Use branded types for IDs (e.g., UserId, JobId)

## DATABASE REQUIREMENTS:
- Use Prisma ORM exclusively for database operations
- Follow the established schema design exactly
- Use transactions for multi-table operations
- Include proper indexes in Prisma schema
- Use UUID for all primary keys
- Include created_at/updated_at on all tables
- Use JSONB for flexible data, not TEXT

## API REQUIREMENTS:
- Use Next.js App Router API routes only
- Validate all inputs with Zod schemas
- Return consistent response format: {success: boolean, data?: any, error?: string}
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Include rate limiting on all endpoints
- Use middleware for authentication checks
- Log all API errors with context

## FRONTEND REQUIREMENTS:
- Use React Server Components when possible
- Use client components only when necessary (user interactions)
- Implement proper loading states for all async operations
- Use React Hook Form for all forms
- Include proper error boundaries
- Use Tailwind CSS only - no custom CSS
- Implement responsive design for mobile
- Use shadcn/ui components when available

# SECTION 2: CODE QUALITY STANDARDS
## ERROR HANDLING REQUIREMENTS:
- Wrap all async operations in try-catch blocks
- Create custom error classes for different error types
- Log errors with sufficient context for debugging
- Return user-friendly error messages (never expose internal errors)
- Implement retry logic for network operations
- Use error boundaries in React components

## SECURITY REQUIREMENTS:
- Validate and sanitize all user inputs
- Use parameterized queries (Prisma handles this)
- Implement proper authentication checks on all protected routes
- Use HTTPS-only cookies for sessions
- Include CSRF protection
- Sanitize data before storing in database
- Never log sensitive information (passwords, tokens)

## PERFORMANCE REQUIREMENTS:
- Use database indexes for all common queries
- Implement proper caching with Redis where appropriate
- Use Next.js Image component for all images
- Implement pagination for large datasets
- Use React Query for client-side caching
- Minimize bundle size with proper imports
- Use lazy loading for non-critical components

## TESTING REQUIREMENTS:
- Write unit tests for all utility functions
- Write integration tests for all API endpoints
- Include error case testing
- Mock external services in tests
- Test both happy path and edge cases
- Use meaningful test descriptions
- Achieve minimum 80% code coverage

# SECTION 3: JOBSWIPE-SPECIFIC REQUIREMENTS
## JOBSWIPE ARCHITECTURE RULES:
- Organize code by feature modules: /src/modules/{auth,jobs,resumes,applications,payments}
- Each module must have: types.ts, api.ts, components/, utils.ts
- Use shared utilities in /src/lib/ for cross-module functionality
- Follow the database schema exactly as designed
- Maintain clear separation between web and desktop app concerns

## USER MANAGEMENT REQUIREMENTS:
- Use JWT with refresh tokens for authentication
- Store user sessions in Redis
- Include subscription tier in user context
- Track usage against subscription limits
- Implement proper logout and session cleanup

## JOB DISCOVERY REQUIREMENTS:
- Implement infinite scroll for job browsing
- Use optimistic updates for job swipes
- Cache job data appropriately
- Include job matching score calculation
- Support both mobile and desktop interfaces

## RESUME SYSTEM REQUIREMENTS:
- Store resume templates with structured metadata
- Use PDF generation with pdf-lib library
- Implement template-based content mapping
- Support multiple resume versions per user
- Include ATS score calculation

## APPLICATION TRACKING REQUIREMENTS:
- Maintain detailed application status tracking
- Support real-time status updates
- Include automation attempt logging
- Track success/failure rates
- Provide detailed error information for failures

## DESKTOP APP REQUIREMENTS:
- Use Electron with secure IPC communication
- Integrate browser-use for automation
- Sync application queue with web platform
- Include proper error handling and user notifications
- Support auto-updates

# SECTION 4: CODE ORGANIZATION STANDARDS
## FILE STRUCTURE REQUIREMENTS:
- Use barrel exports (index.ts) for clean imports
- Group related functionality in modules
- Keep components small and focused (< 200 lines)
- Separate business logic from UI components
- Use custom hooks for complex state logic

## NAMING CONVENTIONS:
- Use PascalCase for components, interfaces, types
- Use camelCase for functions, variables, props
- Use SCREAMING_SNAKE_CASE for constants
- Use kebab-case for file names
- Prefix interface names with 'I' (e.g., IUser)
- Suffix type unions with 'Type' (e.g., StatusType)

## IMPORT ORGANIZATION:
1. React/Next.js imports
2. Third-party library imports
3. Internal module imports (absolute paths)
4. Relative imports
5. Type-only imports last

## COMPONENT STRUCTURE:
1. Imports
2. Types/interfaces
3. Component definition
4. Default export
5. Named exports (if any)

## FUNCTION ORGANIZATION:
1. Type definitions
2. Main function logic
3. Error handling
4. Return statement

# SECTION 5: DOCUMENTATION REQUIREMENTS
## CODE DOCUMENTATION:
- Include JSDoc comments for all exported functions
- Document complex business logic inline
- Include usage examples for utility functions
- Document API endpoints with request/response examples
- Include TODO comments for known improvements

## COMPONENT DOCUMENTATION:
- Include prop types and descriptions
- Document component purpose and usage
- Include example usage in comments
- Document any side effects or external dependencies

## DATABASE DOCUMENTATION:
- Document all Prisma schema relationships
- Include migration notes for breaking changes
- Document index strategies and performance considerations
- Include data validation rules

## API DOCUMENTATION:
- Document all endpoints with OpenAPI/Swagger format
- Include request/response schemas
- Document authentication requirements
- Include error response examples
- Document rate limiting and usage policies

# SECTION 6: IMPLEMENTATION PATTERNS
## REACT PATTERNS TO FOLLOW:
- Use composition over inheritance
- Implement proper prop drilling avoidance with context
- Use custom hooks for reusable logic
- Implement proper cleanup in useEffect
- Use React.memo for expensive components
- Implement proper key props for lists

## API PATTERNS TO FOLLOW:
- Use middleware for cross-cutting concerns
- Implement consistent error handling
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Include request validation middleware
- Use response compression for large payloads
- Implement proper CORS handling

## DATABASE PATTERNS TO FOLLOW:
- Use Prisma transactions for multi-table operations
- Implement soft deletes where appropriate
- Use include/select for query optimization
- Implement proper pagination with cursor-based paging
- Use database constraints for data integrity
- Implement audit logging for sensitive operations

## STATE MANAGEMENT PATTERNS:
- Use React Context for global state
- Use React Query for server state
- Use local state for component-specific data
- Implement proper state normalization
- Use reducer pattern for complex state logic
- Implement optimistic updates where appropriate

# SECTION 7: WHAT TO NEVER DO
## FORBIDDEN PRACTICES:
- Never use 'any' type in TypeScript
- Never commit console.log statements
- Never hardcode configuration values
- Never ignore error handling
- Never use inline styles instead of Tailwind
- Never mutate props directly
- Never use var declarations
- Never store sensitive data in localStorage
- Never skip input validation
- Never use nested ternary operators (> 1 level)
- Never create God components (> 200 lines)
- Never use direct DOM manipulation
- Never ignore TypeScript errors
- Never skip testing for critical functions
- Never use synchronous operations for I/O

## ARCHITECTURAL VIOLATIONS:
- Never break module boundaries without justification
- Never access database directly from frontend
- Never implement microservices patterns
- Never create circular dependencies
- Never couple UI components to data layer
- Never implement custom authentication (use established patterns)
- Never skip database migrations
- Never modify production data directly

# SECTION 8: RESPONSE FORMAT REQUIREMENTS

## WHEN GENERATING CODE, ALWAYS:
1. Provide complete, working code (no placeholders)
2. Include all necessary imports
3. Include proper error handling
4. Include TypeScript types for everything
5. Include basic tests when requested
6. Explain key architectural decisions
7. Highlight any deviations from requirements
8. Include setup/usage instructions
9. Mention any additional dependencies needed
10. Provide file paths and organization

## EXPLAIN YOUR DECISIONS:
- Why you chose specific patterns
- How the code fits into the overall architecture
- What trade-offs were made
- What might need future consideration
- How to test the implementation

## QUALITY CHECKLIST:
Before providing any code, verify:
□ All TypeScript errors resolved
□ Proper error handling included
□ Security considerations addressed
□ Performance implications considered
□ Testing approach defined
□ Documentation included
□ Follows JobSwipe architecture
□ No forbidden practices used
□ Proper imports and exports
□ Consistent naming conventions

# SECTION 9: PRIORITY LEVELS

## ABSOLUTE REQUIREMENTS (Never compromise):
1. TypeScript strict mode compliance
2. Security best practices
3. Error handling and logging
4. Database schema adherence
5. Authentication/authorization

## HIGH PRIORITY (Rarely compromise):
1. Performance optimization
2. Code organization standards
3. Testing coverage
4. Documentation quality
5. Responsive design

## MEDIUM PRIORITY (Can compromise with justification):
1. Advanced optimizations
2. Perfect code elegance
3. Comprehensive comments
4. Extra validation layers

## LOW PRIORITY (Can defer):
1. Advanced features beyond requirements
2. Perfect performance tuning
3. Extensive customization options