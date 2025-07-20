# Documentation: `jwt-token.service.ts`

## Introduction

This document provides a comprehensive explanation of the `jwt-token.service.ts` file. This service is a backend-focused, enterprise-grade service responsible for the creation, verification, and management of JSON Web Tokens (JWTs). It is a critical component for securing the JobSwipe platform, featuring advanced capabilities like key rotation, token revocation, and detailed monitoring.

This explanation is aimed at new developers to help them understand the core principles of secure JWT management in a modern application.

## Core Concepts

### Asymmetric Encryption (RS256)

Unlike simpler JWT implementations that use a single secret key (symmetric, HS256), this service uses the **RS256** algorithm. This is an **asymmetric** algorithm, which means it uses a key pair:

-   **Private Key:** Kept secret on the server. It is used to *sign* (create) tokens.
-   **Public Key:** Can be shared publicly. It is used to *verify* the signature of tokens.

This is more secure because services that only need to *verify* tokens (e.g., other microservices) don't need access to the secret private key. They only need the public key.

### Key Rotation

If a private key is ever compromised, all tokens ever issued with it become untrustworthy. To mitigate this risk, this service implements **key rotation**. It automatically generates a new private/public key pair at regular intervals (e.g., every 24 hours). Old keys are kept for a while to verify existing tokens, but all new tokens are signed with the new key. This limits the window of opportunity for an attacker who might have stolen a key.

### Token Revocation

When a user logs out, changes their password, or is banned, their existing tokens should no longer be valid, even if they haven't expired yet. This service implements a **revocation list**. When a token is revoked (e.g., on logout), its unique identifier (`jti`) is added to a list of invalid tokens. The `verifyToken` function checks this list to ensure a token hasn't been revoked before accepting it.

---

## File Breakdown

### 1. Interfaces

-   **`JwtKeyPair`**: Defines the structure for storing a private key, a public key, and metadata like the key's ID (`kid`) and expiration date.
-   **`JwtTokenConfig`**: A configuration object that specifies all the details needed to create a new token, such as its expiration time, the user it's for (`subject`), and any extra data (`metadata`).
-   **`JwtVerificationResult`**: Defines the shape of the object returned after verifying a token. It includes whether the token is valid, the decoded payload, and any errors.
-   **`TokenMetrics`**: A data structure for tracking the service's performance and health, such as how many tokens have been issued or how many errors have occurred.

### 2. `JwtTokenService` Class

This is the main class that orchestrates all the token-related logic.

#### Constructor & Initialization

-   `constructor()`: Sets up the intervals for how often to rotate keys and clean up the list of revoked tokens.
-   `initialize()`: This private method is called by the constructor. It generates the first key pair and starts the scheduled timers for key rotation and cleanup.

#### Key Management

-   `generateKeyPair()`: Uses Node.js's built-in `crypto` library to create a new 2048-bit RSA key pair. Each key is given a unique ID (`keyId`).
-   `rotateKeys()`: The core of the key rotation feature. It generates a new key pair, sets it as the current one for signing new tokens, and cleans up any old keys that have expired.
-   `getCurrentKey()` & `getKeyById()`: Helper methods to retrieve the current signing key or a specific key by its ID for verification.

#### Core Token Operations

-   `createToken(config)`: This is the token creation engine.
    1.  It gets the current private key.
    2.  It builds the JWT **payload** with all the claims (like `sub`, `exp`, `iat`, `role`, etc.).
    3.  It builds the JWT **header**, importantly including the `kid` (key ID) so that verifiers know which public key to use.
    4.  It signs the header and payload with the private key to create the signature.
    5.  It combines the base64-encoded parts into the final `header.payload.signature` token string.
-   `verifyToken(token)`: This is the token verification engine.
    1.  It splits the token into its three parts.
    2.  It decodes the header to find the `kid`.
    3.  It retrieves the corresponding public key using the `kid`.
    4.  It checks if the token's ID (`jti`) is in the `revokedTokens` list.
    5.  It uses the public key to verify that the signature is valid for the given header and payload.
    6.  It checks that the token has not expired (`exp` claim) and that the audience (`aud`) and issuer (`iss`) match the server's configuration.
-   `revokeToken(tokenId)`: Adds a token's unique identifier (`jti`) to the `revokedTokens` set.

#### Monitoring & Health

-   `getPublicKeys()`: Exposes a list of all the current, valid public keys. This can be used to create a JWKS (JSON Web Key Set) endpoint, which is a standard way for other services to fetch the keys they need for verification.
-   `getMetrics()` & `getHealthStatus()`: Provide methods to monitor the service's health, including the number of keys, error rates, and the last rotation time. This is crucial for observability in a production environment.

### 3. Factory Functions

These are helper functions that make it easier to create specific types of tokens without having to manually fill out the entire `JwtTokenConfig` each time.

-   `createJwtTokenService()`: A simple factory to create an instance of the service.
-   `createAccessTokenConfig()`: Creates a standard configuration for a short-lived access token.
-   `createRefreshTokenConfig()`: Creates a configuration for a long-lived refresh token.
-   `createDesktopTokenConfig()`: Creates a configuration for a very long-lived token specifically for the desktop application.
-   `createVerificationTokenConfig()`: Creates a configuration for special, one-time-use tokens, such as for verifying an email address or resetting a password.

### 4. Utility Functions

This section provides pure, stateless helper functions for working with decoded JWT payloads.

-   `extractUserIdFromPayload()`: A simple getter for the user ID (`sub` claim).
-   `isTokenExpired()`: Checks if a payload's expiration time is in the past.
-   `tokenNeedsRefresh()`: Checks if a token is close to expiring.
-   `tokenHasPermission()` & `tokenHasFeature()`: Functions to check if a token's payload contains specific permissions or feature flags, which is useful for authorization (Role-Based Access Control).

## How It's Used in the Backend

1.  **On Login:** When a user successfully logs in, the backend authentication controller would use this service to create both an access token and a refresh token.
    ```typescript
    // Inside an authentication controller
    const accessTokenConfig = createAccessTokenConfig(user.id, user.email, ...);
    const refreshTokenConfig = createRefreshTokenConfig(user.id, user.email, ...);

    const accessToken = await defaultJwtTokenService.createToken(accessTokenConfig);
    const refreshToken = await defaultJwtTokenService.createToken(refreshTokenConfig);

    // Send tokens to the client
    ```

2.  **On Authenticated Requests:** For every incoming API request that requires authentication, a middleware would use this service to verify the token provided in the `Authorization` header.
    ```typescript
    // Inside an authentication middleware
    const result = await defaultJwtTokenService.verifyToken(tokenFromHeader);

    if (result.valid && result.payload) {
      // Attach user info to the request object
      request.user = result.payload;
      next();
    } else {
      // Deny access
      response.status(401).send({ error: 'Unauthorized' });
    }
    ```

## Conclusion

The `jwt-token.service.ts` is a powerful, secure, and feature-rich service that provides the foundation for the JobSwipe platform's authentication and authorization system. By handling complex features like asymmetric key rotation and token revocation, it abstracts away the most difficult parts of JWT security, allowing developers to easily create and verify tokens with confidence. Its built-in metrics and health checks also make it a robust and observable component suitable for a high-availability, enterprise-level system.
