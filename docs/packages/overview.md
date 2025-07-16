# JobSwipe Packages Overview

## What Are Packages?

The JobSwipe project uses a **monorepo** structure with shared packages. Think of packages as building blocks that contain reusable code, types, utilities, and services that multiple applications can use. Instead of copying code between the web app, desktop app, and API server, we create packages that all apps can import and use.

## Why Use Packages?

### 1. **Code Reusability**
- Write authentication logic once, use it everywhere
- Share TypeScript types between frontend and backend
- Common utilities available across all applications

### 2. **Consistency**
- Same validation rules in web and desktop apps
- Unified error handling across the platform
- Standardized database operations

### 3. **Maintainability**
- Update a utility function in one place
- Fix a bug once, it's fixed everywhere
- Easier to test individual components

### 4. **Team Collaboration**
- Clear boundaries between different functionalities
- Teams can work on different packages independently
- Easier to onboard new developers

## Package Structure

```
packages/
├── config/          # Environment and application configuration
├── database/        # Database client, schema, and utilities
├── shared/          # Authentication, JWT, and common functionality
├── types/           # Global TypeScript types and interfaces
├── utils/           # Common utility functions and helpers
└── ui/              # Shared UI components (future)
```

## How Packages Work Together

### The Foundation Layer
- **`@jobswipe/types`** - Provides TypeScript types for everything
- **`@jobswipe/utils`** - Basic utility functions (string manipulation, validation, etc.)

### The Configuration Layer
- **`@jobswipe/config`** - Manages environment variables and application settings
- Uses types from `@jobswipe/types`

### The Data Layer
- **`@jobswipe/database`** - Handles all database operations
- Uses types from `@jobswipe/types`
- Uses utilities from `@jobswipe/utils`

### The Business Logic Layer
- **`@jobswipe/shared`** - Authentication, JWT tokens, business logic
- Uses all other packages as dependencies

### The Presentation Layer (Future)
- **`@jobswipe/ui`** - Shared React components
- Uses types, utils, and shared packages

## Package Dependencies

### Dependency Flow
```
@jobswipe/shared
    ↓ depends on
@jobswipe/database
    ↓ depends on
@jobswipe/config
    ↓ depends on
@jobswipe/types ← @jobswipe/utils
```

### What This Means
- `@jobswipe/types` and `@jobswipe/utils` are foundational (no dependencies)
- `@jobswipe/config` can use types and utils
- `@jobswipe/database` can use config, types, and utils
- `@jobswipe/shared` can use all other packages

## Package Naming Convention

All packages follow the `@jobswipe/` namespace:
- `@jobswipe/database` - Database-related functionality
- `@jobswipe/shared` - Shared business logic
- `@jobswipe/config` - Configuration management
- `@jobswipe/types` - TypeScript type definitions
- `@jobswipe/utils` - Utility functions
- `@jobswipe/ui` - User interface components

## How Applications Use Packages

### Web Application (Next.js)
```typescript
// Uses authentication from shared package
import { AuthProvider } from '@jobswipe/shared'

// Uses database utilities
import { getUserById } from '@jobswipe/database'

// Uses configuration
import { getConfig } from '@jobswipe/config'
```

### Desktop Application (Electron)
```typescript
// Uses the same authentication system
import { JwtTokenService } from '@jobswipe/shared'

// Uses the same database operations
import { createUser } from '@jobswipe/database'

// Uses the same utilities
import { validateEmail } from '@jobswipe/utils'
```

### API Server (Fastify)
```typescript
// Uses all packages for backend operations
import { db } from '@jobswipe/database'
import { authenticateUser } from '@jobswipe/shared'
import { getConfig } from '@jobswipe/config'
```

## Build Process

### Individual Package Builds
Each package can be built independently:
- Packages are written in TypeScript
- Built output goes to `dist/` folder
- Other packages and apps import from the built version

### Workspace Integration
- npm workspaces automatically link packages
- Changes in one package are immediately available to others
- Build system handles dependencies automatically

## Key Benefits for JobSwipe

### 1. **Authentication Consistency**
- Same JWT token system across web, desktop, and API
- Unified user management and session handling
- Consistent security policies everywhere

### 2. **Database Consistency**
- Same Prisma client configuration
- Unified database utility functions
- Consistent data validation rules

### 3. **Type Safety**
- Shared TypeScript types prevent integration errors
- Compile-time checking across all applications
- IDE support with autocompletion

### 4. **Development Speed**
- Developers don't need to rewrite common functionality
- Easy to add new features that work across all apps
- Faster testing and debugging

## Common Patterns

### Package Structure
```
package-name/
├── src/                 # Source code
│   ├── index.ts        # Main entry point
│   ├── types/          # Type definitions
│   ├── utils/          # Utility functions
│   └── services/       # Service classes
├── dist/               # Built output
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

### Export Pattern
Each package has a main `index.ts` file that exports everything:
- Makes imports clean and simple
- Provides a single entry point
- Easier to manage what's publicly available

### Versioning
- All packages use the same version (1.0.0)
- Synchronized releases across the monorepo
- No version conflicts between packages

## Next Steps

To understand the packages better, read the detailed documentation for each:

1. **[Types Package](./types-package.md)** - Global TypeScript types
2. **[Utils Package](./utils-package.md)** - Common utility functions
3. **[Config Package](./config-package.md)** - Configuration management
4. **[Database Package](./database-package.md)** - Database operations
5. **[Shared Package](./shared-package.md)** - Business logic and authentication
6. **[UI Package](./ui-package.md)** - Shared components (future)

Each package documentation explains:
- What the package does
- Why it exists
- How it works
- How other packages and apps use it
- Key features and capabilities