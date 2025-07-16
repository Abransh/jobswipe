# @jobswipe/utils Package

## Purpose

The `@jobswipe/utils` package provides a comprehensive collection of utility functions and helper methods that are used throughout the JobSwipe platform. These utilities handle common operations like string manipulation, data validation, array processing, and async operations.

## Why This Package Exists

### 1. **Code Reusability**
- Common utility functions used across all applications
- Prevents code duplication and inconsistencies
- Provides tested, reliable implementations

### 2. **Performance Optimization**
- Optimized implementations of common operations
- Memoization and caching for expensive operations
- Debouncing and throttling for UI interactions

### 3. **Developer Productivity**
- Ready-to-use functions for common tasks
- Consistent API across all utilities
- Reduces development time for common operations

### 4. **Quality Assurance**
- Well-tested utility functions
- Handles edge cases and error conditions
- Provides consistent behavior across the platform

## Utility Categories

### 1. **String Utilities**
Essential string manipulation and validation functions:

**Basic Operations**
- `isEmpty()` - Check if string is empty or whitespace
- `isNotEmpty()` - Check if string has content
- `truncate()` - Truncate string to specific length with suffix
- `capitalize()` - Capitalize first letter of string

**Case Conversion**
- `toCamelCase()` - Convert to camelCase format
- `toKebabCase()` - Convert to kebab-case format
- `toSnakeCase()` - Convert to snake_case format
- `slugify()` - Create URL-friendly slugs

**Generation and Security**
- `randomString()` - Generate random strings
- `maskString()` - Mask sensitive information
- Used for password generation, tokens, and privacy

### 2. **Number Utilities**
Mathematical operations and number formatting:

**Validation and Manipulation**
- `isNumber()` - Check if value is valid number
- `clamp()` - Constrain number between min/max values
- `round()` - Round to specific decimal places
- `randomNumber()` - Generate random numbers in range

**Formatting**
- `formatNumber()` - Add thousand separators
- `formatBytes()` - Convert bytes to human-readable format
- `percentage()` - Calculate percentage values
- Used for displaying file sizes, statistics, and user data

### 3. **Array Utilities**
Array manipulation and processing functions:

**Basic Operations**
- `isEmptyArray()` - Check if array is empty
- `unique()` - Remove duplicate values
- `uniqueBy()` - Remove duplicates based on key
- `flatten()` - Flatten nested arrays

**Advanced Operations**
- `chunk()` - Split array into smaller chunks
- `shuffle()` - Randomly shuffle array elements
- `randomElement()` - Get random element from array
- `groupBy()` - Group array elements by key

**Use Cases**
- Processing job listings and user data
- Organizing search results
- Handling form data and validation

### 4. **Object Utilities**
Object manipulation and processing functions:

**Basic Operations**
- `isEmptyObject()` - Check if object is empty
- `deepClone()` - Create deep copy of objects
- `deepMerge()` - Merge objects recursively
- `isObject()` - Check if value is object

**Property Manipulation**
- `getNestedProperty()` - Get nested object values
- `setNestedProperty()` - Set nested object values
- `removeUndefined()` - Remove undefined properties
- `pick()` - Select specific properties
- `omit()` - Remove specific properties

**Use Cases**
- Configuration management
- API response processing
- Form data handling

### 5. **Date Utilities**
Date and time manipulation functions:

**Validation and Parsing**
- `isValidDate()` - Check if date is valid
- `formatISODate()` - Format date to ISO string
- `parseISODate()` - Parse ISO date string
- `addDays()` - Add days to date

**Comparison and Calculation**
- `daysDifference()` - Calculate days between dates
- `isToday()` - Check if date is today
- `isPast()` - Check if date is in past
- `isFuture()` - Check if date is in future

**Time Range Operations**
- `startOfDay()` - Get start of day
- `endOfDay()` - Get end of day
- Used for scheduling, reporting, and time-based features

### 6. **Validation Utilities**
Data validation and verification functions:

**Format Validation**
- `isValidEmail()` - Validate email addresses
- `isValidURL()` - Validate URLs
- `isValidUUID()` - Validate UUID format
- `isValidPhone()` - Validate phone numbers

**Security Validation**
- `validatePasswordStrength()` - Check password strength
- Returns score and feedback for password requirements
- Used for user registration and password changes

**Use Cases**
- Form validation
- API input validation
- Data integrity checks

### 7. **Async Utilities**
Asynchronous operation helpers:

**Timing and Delays**
- `sleep()` - Async sleep function
- `retry()` - Retry failed operations with exponential backoff
- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls

**Use Cases**
- API retry logic
- UI interaction optimization
- Rate limiting and performance

### 8. **Error Utilities**
Error handling and processing functions:

**Error Creation**
- `createError()` - Create custom error objects
- `getErrorMessage()` - Extract error messages safely
- Used for consistent error handling

**Safe Operations**
- `safeJsonParse()` - Safe JSON parsing with fallback
- `safeJsonStringify()` - Safe JSON stringify with fallback
- Prevents application crashes from malformed data

### 9. **Crypto Utilities**
Cryptographic and ID generation functions:

**ID Generation**
- `generateUUID()` - Generate UUID v4
- `generateId()` - Generate random IDs
- `simpleHash()` - Simple string hashing
- Used for unique identifiers and data integrity

### 10. **Environment Utilities**
Environment detection and configuration:

**Platform Detection**
- `isBrowser()` - Check if running in browser
- `isNode()` - Check if running in Node.js
- `getEnvVar()` - Get environment variables safely

**Environment Checks**
- `isDevelopment()` - Check if in development mode
- `isProduction()` - Check if in production mode
- Used for conditional logic and configuration

### 11. **Performance Utilities**
Performance monitoring and optimization:

**Measurement**
- `measureTime()` - Measure function execution time
- `memoize()` - Cache function results
- Used for performance optimization and monitoring

## How Other Packages Use This Package

### @jobswipe/shared
- Uses validation utilities for authentication
- Uses string utilities for token generation
- Uses async utilities for API operations
- Uses crypto utilities for security features

### @jobswipe/database
- Uses object utilities for query processing
- Uses validation utilities for data integrity
- Uses array utilities for result processing
- Uses date utilities for timestamp handling

### @jobswipe/config
- Uses environment utilities for configuration
- Uses validation utilities for settings
- Uses object utilities for config merging
- Uses string utilities for processing

## Integration with Applications

### Web Application
- Uses string utilities for form processing
- Uses validation utilities for user input
- Uses async utilities for API calls
- Uses date utilities for scheduling features

### Desktop Application
- Uses file utilities for automation
- Uses async utilities for browser operations
- Uses crypto utilities for secure storage
- Uses performance utilities for monitoring

### API Server
- Uses validation utilities for request processing
- Uses error utilities for error handling
- Uses async utilities for database operations
- Uses performance utilities for monitoring

## Key Benefits

### 1. **Consistency**
- Same utility functions across all applications
- Consistent behavior and error handling
- Unified approach to common operations

### 2. **Reliability**
- Well-tested implementations
- Handles edge cases and error conditions
- Prevents common programming errors

### 3. **Performance**
- Optimized implementations
- Caching and memoization where appropriate
- Efficient algorithms for common operations

### 4. **Developer Experience**
- Clear, descriptive function names
- Comprehensive type definitions
- Extensive documentation and examples

## Best Practices

### 1. **Pure Functions**
- Most utilities are pure functions without side effects
- Predictable behavior and easy testing
- Safe for concurrent and parallel execution

### 2. **Error Handling**
- Graceful error handling with meaningful messages
- Fallback values for safe operations
- Consistent error patterns across utilities

### 3. **Type Safety**
- Full TypeScript support with proper types
- Generic functions where appropriate
- Compile-time error checking

### 4. **Performance Considerations**
- Efficient algorithms for common operations
- Minimal memory allocation
- Optimized for frequently used functions

## Maintenance and Evolution

### Adding New Utilities
- Follow existing patterns and conventions
- Include comprehensive tests
- Add proper TypeScript types
- Update documentation

### Categories for Future Utilities
- File system operations
- Network utilities
- Compression and encoding
- Data transformation
- Internationalization helpers

The utils package is essential for maintaining code quality and developer productivity across the JobSwipe platform. It provides the foundational utilities that make complex operations simple and reliable.