# Documentation: `auth.ts`

## Introduction: The Professor's Guide to the Vocabulary of Authentication

Welcome, class. Today we will be dissecting the `auth.ts` file. If `api.ts` is the dictionary for our entire application's communication, then `auth.ts` is the specialized glossary for its most critical dialect: the language of **Authentication and Authorization**.

This file, like `api.ts`, does not contain executable logic. It is a foundational file composed entirely of **type definitions**. Its sole purpose is to define, with absolute precision, the shape of every piece of data related to user identity, sessions, tokens, and permissions. It is the single source of truth that ensures our frontend, backend, and all related services have a shared, unambiguous understanding of what constitutes a `User`, a `Session`, a `Token`, and an `Error`.

Mastering the contents of this file is non-negotiable for any developer working on the JobSwipe platform. It is the key to understanding our entire security and identity model.

## Core Concepts: The Pillars of Our Identity Model

### Branded Types: The Power of Nominal Typing

At the very top of the file, you will see a powerful TypeScript pattern known as **Branded Types**:

```typescript
export type UserId = string & { readonly __brand: 'UserId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
```

In standard TypeScript, `UserId` would just be an alias for `string`. This means you could accidentally assign a `SessionId` to a variable expecting a `UserId`, and the compiler would not complain. Branded types prevent this. By intersecting the `string` type with a unique, fictional `__brand` property, we create a new **nominal type**. Now, a `UserId` is no longer just any string; it is a special *kind* of string. The compiler will now throw an error if you try to mix these different types of IDs, preventing a subtle but dangerous class of bugs.

### Enumerations: A Vocabulary for States and Events

This file uses `enum` extensively to create a clear, self-documenting vocabulary for various authentication concepts:

-   **`AuthProvider`**: Defines the list of all possible ways a user can log in (e.g., `CREDENTIALS`, `GOOGLE`, `GITHUB`).
-   **`AuthSource`**: Tracks *where* an authentication event originated (e.g., `WEB`, `DESKTOP`, `MOBILE`). This is invaluable for metrics and security analysis.
-   **`TokenType`**: Differentiates between the various kinds of JWTs our system uses, each with its own purpose and lifespan (e.g., `ACCESS`, `REFRESH`, `PASSWORD_RESET`).
-   **`AuthEvent`**: Provides a complete list of auditable security events, from `LOGIN_SUCCESS` to `SUSPICIOUS_ACTIVITY`. This forms the basis of our security logging.

### Zod Schemas: From Compile-Time to Runtime

Just as in `api.ts`, this file includes **Zod schemas** (`LoginRequestSchema`, `RegisterRequestSchema`, etc.). These schemas are the runtime counterparts to our TypeScript interfaces. The backend uses them to parse and validate the body of incoming authentication requests, ensuring that no malformed data can ever reach our core application logic. This is our first line of defense at the API boundary.

---

## An In-Depth Tour of `auth.ts`

Let's proceed with a systematic examination of the file's sections.

### 1. Branded Types & Enums

As discussed, these sections establish the core vocabulary and nominal typing for our entire authentication system.

### 2. Core Authentication Interfaces

This is the heart of the file, defining the primary data structures.

-   **`AuthenticatedUser`**: Defines the shape of the user object that is safe to be sent to the client. Notice that it does *not* contain sensitive information like a password hash. It includes profile data, subscription status, and security context.
-   **`JwtPayload`**: Defines the structure of the data embedded within our JSON Web Tokens. This is the ground truth of a user's identity and permissions for the duration of the token's validity.
-   **`AuthTokens`**: A simple interface representing the pair of access and refresh tokens returned upon a successful login.
-   **`AuthSession`**: A rich object representing a user's session. It contains not just the user and token info, but also a wealth of security context, such as the IP address, user agent, and device information associated with that session.

### 3. Authentication Request/Response Types

This section defines the precise contracts for all authentication-related API endpoints.

-   **`LoginRequest` / `LoginResponse`**: The contract for the login endpoint.
-   **`RegisterRequest` / `RegisterResponse`**: The contract for the user registration endpoint.
-   **`RefreshTokenRequest` / `RefreshTokenResponse`**: The contract for exchanging a refresh token for a new access token.
-   ...and so on for password resets, password changes, etc.

By defining these explicitly, both frontend and backend developers know exactly what data to send and what to expect in return for every interaction.

### 4. Token Exchange & Desktop Auth Types

These sections define the data structures specifically for the secure web-to-desktop authentication flow, as implemented by the `TokenExchangeService`.

### 5. Audit and Security Types

This section demonstrates a mature approach to security.

-   **`AuthAuditLog`**: Defines the structure for a single entry in our security audit trail. Every significant authentication event (`AuthEvent`) will generate a log entry with this shape, providing a detailed, immutable record for security analysis and incident response.
-   **`SecurityIncident`**: Defines the structure for a high-level security incident report, which could be generated by an automated system that detects patterns of malicious activity from the audit logs.

### 6. Validation Schemas (Zod)

This section contains the Zod schemas that correspond to the request interfaces. For example, `LoginRequestSchema` not only ensures that `email` and `password` are strings, but it can also enforce that the email is a valid email format and the password meets a minimum length requirement.

### 7. Utility Types and Functions

This section provides helper functions and constants.

-   **`createBrandedId()` / `extractUserId()`**: Functions for safely working with the branded types.
-   **Type Guards (`isAuthenticatedUser`, `isJwtPayload`)**: These are functions that perform a runtime check on an object and, if the check passes, inform the TypeScript compiler about the object's specific type within a certain scope. This is a powerful pattern for working with data of an unknown shape (e.g., a decoded JSON object).
-   **Constants (`TOKEN_EXPIRATION`, `RATE_LIMITS`, `SECURITY_CONFIG`)**: This is a crucial part of the file. It centralizes all security-related configuration values, such as token lifespans and rate-limiting thresholds. This makes it easy to review and adjust our security posture from a single location.

### 8. Error Types

This final, critical section defines a custom `AuthError` class and a corresponding `AuthErrorCode` enum. This standardizes error handling for all authentication-related failures. Instead of throwing a generic `Error`, our code will throw a `new AuthError(...)`, which includes a specific, machine-readable error code. This allows the frontend to implement specific logic based on the *type* of error (e.g., if the error code is `TWO_FACTOR_REQUIRED`, it can show the 2FA input field).

## The Grand Picture: A Secure and Maintainable System

When you combine the concepts in this file, a picture of a highly secure, robust, and maintainable authentication system emerges.

-   A request comes into the backend to the `/login` endpoint.
-   The backend middleware uses the `LoginRequestSchema` from this file to validate the request body.
-   If validation passes, the login logic runs. If it fails, the backend throws a `new AuthError(AuthErrorCode.INVALID_CREDENTIALS)`.
-   The error is caught by a global error handler, which uses the error's `code` and `statusCode` to build a standardized `ApiErrorResponse` (defined in `api.ts`).
-   The frontend receives the response. It checks `response.success` (which is `false`) and then checks `response.errorCode`. Because the `errorCode` is `INVALID_CREDENTIALS`, it knows to display the message "Invalid email or password" to the user.

Every step of this flow is governed by the types and contracts defined in this `auth.ts` file.

## Conclusion: A Masterclass in Type-Driven Design

The `auth.ts` file is a perfect example of **Type-Driven Design**. We have not just written code; we have first built a comprehensive, precise, and strict model of our authentication domain. This model, expressed through TypeScript types, enums, and schemas, becomes the blueprint that guides the development of the entire system. It reduces bugs, improves developer productivity, and serves as its own best form of documentation. A thorough understanding of this file is a foundational requirement for any developer wishing to contribute to the security and stability of the JobSwipe platform.