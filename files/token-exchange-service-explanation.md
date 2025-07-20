# Documentation: `token-exchange.service.ts`

## Introduction: The Professor's Guide to Cross-Device Authentication

Class, take your seats. Today we are exploring a sophisticated and fascinating piece of backend architecture: the `token-exchange.service.ts`. In a world where users seamlessly transition between their laptops, desktops, and mobile devices, the challenge of maintaining a persistent and secure authentication state across these different platforms is significant. This service provides an elegant and secure solution to that very problem.

Its core purpose is to act as a **secure bridge** between a user's temporary, session-based authentication on the web and a persistent, long-lived authentication state on their desktop application. It allows a user, already logged into the JobSwipe website, to authorize their JobSwipe desktop app without having to re-enter their password. This is a cornerstone of a modern, frictionless user experience.

## Core Concepts: The Pillars of Secure Token Exchange

To appreciate the design of this service, we must first understand the fundamental concepts it employs.

### The Problem: Bridging the Trust Gap

Imagine a user is logged into our website. Their browser has a secure session. Now, they open our desktop application. How does the desktop app know it's the same legitimate user? It cannot access the browser's cookies or session storage. We could ask the user to log in again, but that's inconvenient. This service solves this by creating a secure, one-time-use "introduction" mechanism.

### The Solution: A Two-Step Secure Handshake

This service implements a highly secure, two-step token exchange flow:

1.  **Initiation (The User's Request):** From the secure environment of their web session, the user clicks a button like "Authorize Desktop App." This triggers a call to the `initiateExchange` method. The service generates a short-lived, single-use **Exchange Token**. This token is like a temporary, secret password that the user will physically copy and paste into their desktop application.

2.  **Completion (The Desktop App's Request):** The desktop application, now in possession of the Exchange Token, calls the `completeExchange` method. The service validates this token, ensuring it's valid, unexpired, and unused. If everything checks out, the service generates a special, **Long-Lived Desktop Token** (a JWT) and sends it to the desktop app. The desktop app can then store this token securely and use it for authentication for an extended period (e.g., 90 days).

This process is secure because the sensitive, long-lived token is never exposed on the more vulnerable web front-end. It is only ever transmitted directly to the desktop client after a successful, user-initiated handshake.

### Device Registration and Management

This service goes beyond a simple exchange. It treats each desktop application instance as a unique, registered **device**. It tracks which devices are authorized for a user, allowing them (and administrators) to see and manage all connected devices. This is a critical security feature, enabling a user to revoke access for a lost or stolen laptop, for example.

---

## An In-Depth Tour of `token-exchange.service.ts`

Let's now dissect the file, method by method, to understand its inner workings.

### 1. Interfaces: The Architectural Schematics

-   **`TokenExchangeConfig`**: Defines the rules of the exchange, such as how long the temporary exchange token is valid (`exchangeTokenTTL`) and how many devices a user is allowed to authorize (`maxExchangesPerUser`).
-   **`DeviceInfo`**: A structured representation of the desktop client, capturing its unique ID, name, operating system, etc.
-   **`ExchangeTokenMapping`**: The internal record created during the initiation step. It links the temporary exchange token to the user's web session and the device they intend to authorize.
-   **`DesktopTokenInfo`**: The definitive record of an authorized desktop device, containing its unique token ID, user ID, and expiration details.
-   **`TokenExchangeMetrics`**: A vital interface for monitoring the health and usage of the exchange service.

### 2. `TokenExchangeService` Class: The Exchange Engine

This class is the heart of the operation, orchestrating the entire secure handshake process.

#### Constructor and Dependencies

-   `constructor()`: The service is instantiated with two critical dependencies: the `JwtTokenService` (to create the final long-lived desktop token) and the `RedisSessionService` (to validate the user's initial web session). This is a prime example of **Dependency Injection**, a powerful design pattern.

#### The Public API: Core Exchange Methods

-   `initiateExchange(sessionId, deviceInfo)`: This is the first step of the handshake.
    1.  It rigorously validates that the `sessionId` from the web client corresponds to a real, active session in Redis.
    2.  It checks against the configured limits to prevent abuse (e.g., a user trying to create hundreds of exchange tokens).
    3.  It generates a cryptographically secure, random exchange token.
    4.  It stores an `ExchangeTokenMapping` in memory (or a database in a larger system), linking the token to the user and session.
    5.  It returns the exchange token to the web client with clear instructions for the user.

-   `completeExchange(exchangeToken, deviceInfo)`: This is the second and final step, performed by the desktop client.
    1.  It looks up the provided `exchangeToken` in its internal store.
    2.  It performs a series of critical security checks: Is the token valid? Has it already been used? Has it expired? Does the device ID from the desktop app match the one provided during initiation?
    3.  If all checks pass, it uses the `JwtTokenService` to mint a new, long-lived JWT specifically for the desktop device.
    4.  It creates a permanent `DesktopTokenInfo` record to track this newly authorized device.
    5.  It marks the exchange token as used to prevent replay attacks.
    6.  It returns the long-lived token to the desktop client, completing the secure bridge.

#### Device and Token Management Methods

-   `validateDesktopToken(tokenId)`: A method for checking the validity of a desktop token on subsequent requests from the desktop app.
-   `revokeDesktopToken(tokenId, reason)`: Allows a user or administrator to invalidate a specific desktop token, effectively logging out that device.
-   `revokeAllUserTokens(userId, reason)`: A powerful method to log a user out of all their authorized desktop devices at once.
-   `getUserDesktopTokens(userId)`: Allows a user to view a list of all their authorized devices.

### 3. Factory and Utility Functions: Code Elegance and Reusability

-   **Factory Functions (`create...`)**: These provide a clean way to instantiate the service with default or custom configurations.
-   **Utility Functions (`generateDeviceId`, `isValidExchangeToken`, etc.)**: These are pure, stateless helper functions that encapsulate specific logic, such as generating a unique device fingerprint or validating the format of a token. This keeps the main service logic clean and focused on the orchestration of the exchange.

## The Grand Picture: A Seamless User Journey

1.  **User Action:** The user, logged into `jobswipe.com`, navigates to their account settings and clicks "Link a New Desktop App."
2.  **API Call 1 (Initiate):** The frontend sends a request to the `/api/auth/exchange/initiate` endpoint. The backend calls `tokenExchangeService.initiateExchange()`.
3.  **User Action 2:** The user sees a 5-minute-valid token (`abc-123`) on their screen. They open their JobSwipe desktop app and paste this token into the login screen.
4.  **API Call 2 (Complete):** The desktop app sends a request to `/api/auth/exchange/complete`, including the exchange token and its own device information.
5.  **Backend Magic:** The backend calls `tokenExchangeService.completeExchange()`. The service validates the token and, if successful, generates a 90-day valid JWT.
6.  **Success:** The desktop app receives the long-lived JWT, stores it securely in its local keychain, and is now fully authenticated. The user did not need to type their password into the desktop app, and the entire process was secure.

## Conclusion: A Masterclass in Secure Inter-Platform Communication

The `token-exchange.service.ts` is a brilliant example of how to solve a complex, real-world authentication problem with a secure, robust, and user-friendly design. It demonstrates a deep understanding of security principles like defense-in-depth, the principle of least privilege (the short-lived token has no power on its own), and secure handshakes. By abstracting this complexity into a well-defined service, it provides a powerful and easy-to-use tool for building the kind of seamless, multi-platform experiences that modern users expect. For any developer, studying this service is a lesson in building bridges—not just between devices, but between user convenience and ironclad security.
