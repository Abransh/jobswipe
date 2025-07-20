# Documentation: `redis-session.service.ts`

## Introduction: The Professor's Guide to Session Management

Welcome, aspiring developer, to a masterclass on modern, scalable session management. The file before you, `redis-session.service.ts`, is more than just code; it's a blueprint for a robust, enterprise-grade system that handles one of the most critical aspects of any web application: knowing who the user is, what they are doing, and from where.

This service acts as the server's memory, providing a fast and persistent way to manage user sessions. While the `JwtTokenService` deals with the cryptographic proof of identity (the tokens), this `RedisSessionService` deals with the stateful *context* of that identity. Think of the JWT as a passport, and the Redis session as the immigration officer's computer screen, which shows the passport holder's detailed, up-to-date travel history and status.

## Core Concepts: The Pillars of Session Management

To truly understand this service, we must first grasp the foundational concepts it is built upon.

### What is a Session?

A session represents a single, continuous period of interaction between a user and the application. It starts when they log in and ends when they log out or are timed out. This service stores a rich set of data for each session, including the user's ID, their IP address, the device they're using, and when they were last active.

### Why Redis?

Databases like PostgreSQL are excellent for storing structured, relational data, but they can be slow for the rapid-fire read and write operations required for session management. **Redis**, on the other hand, is an **in-memory data store**. This means it keeps data in the server's RAM, making it incredibly fast.

By storing session data in Redis, we achieve:
1.  **High Performance:** Lightning-fast access to session data on every user request.
2.  **Scalability:** Redis is designed for high-concurrency environments. If we have multiple instances of our API server, they can all connect to the same central Redis store to share session information.
3.  **Persistence (with benefits):** Redis can be configured to persist data to disk, preventing data loss if the server restarts. It also has built-in support for setting an expiration time on data (`TTL` - Time To Live), which is perfect for automatically expiring old sessions.

### The Mock Redis Client: A Teaching Tool

You will notice a large portion of this file is a `MockRedisClient`. In a real-world application, we would use a battle-tested library like `ioredis`. However, for development, testing, and, in this case, for learning, a mock client is invaluable. It perfectly simulates the behavior of a real Redis client without requiring you to install and run a Redis server. It allows us to understand the *logic* of the service without getting bogged down in infrastructure setup.

---

## An In-Depth Tour of `redis-session.service.ts`

Let's dissect the file, section by section.

### 1. Interfaces: The Architectural Blueprint

-   **`RedisConfig`**: Defines all the necessary parameters to connect to a Redis server.
-   **`SessionCreateOptions`**, **`SessionUpdateOptions`**, **`SessionQueryOptions`**: These interfaces define the shape of the data required for creating, updating, and searching for sessions. They act as strict contracts for our methods, ensuring data consistency.
-   **`SessionMetrics`**: A crucial interface for observability. It defines the data points we will track to monitor the health and performance of our session management system.
-   **`RedisClient`, `RedisMulti`, `RedisPipeline`**: These define the contract for our Redis client. By programming to an interface rather than a concrete implementation, we make our service more flexible and easier to test.

### 2. `RedisSessionService` Class: The Heart of the Operation

This class encapsulates all the logic for managing sessions.

#### Constructor and Initialization

-   `constructor()`: It takes the Redis connection configuration and other options. It initializes the (mock) Redis client and sets up the metrics object.
-   `startCleanupJob()`: In the constructor, a timer is started using `setInterval`. This creates a background process that will run periodically (e.g., every hour) to clean up old, expired sessions from the database, ensuring the system remains efficient.

#### Core Public Methods

These methods form the public API of our service.

-   `createSession(options)`: This is where a new user session begins.
    1.  It generates a unique, secure `sessionId`.
    2.  It constructs the `AuthSession` object, filling it with user data, IP address, device info, and timestamps.
    3.  It stores the session object in Redis as a JSON string. Crucially, it uses the `setex` command, which sets the value *and* an expiration time. This is Redis's built-in mechanism for automatic session timeout.
    4.  It also adds the new `sessionId` to a separate list in Redis, keyed by the `userId`. This allows us to quickly find all active sessions for a specific user.
    5.  It updates the monitoring metrics.
-   `getSession(sessionId)`: Retrieves a session from Redis. It performs a critical check: if the session is expired, it deletes it and returns `null`, ensuring that no part of the application can act on an invalid session.
-   `updateSession(sessionId, updates)`: Modifies an existing session with new information, such as an updated `lastUsedAt` timestamp.
-   `deleteSession(sessionId)`: Explicitly removes a session from Redis, for example, when a user logs out.
-   `revokeSession(sessionId)`: A security-critical function. It doesn't delete the session but marks its `status` as `REVOKED`. This allows us to maintain a record of the session for auditing purposes while ensuring it can no longer be used.
-   `getUserSessions(userId, options)`: Retrieves all session IDs associated with a user, then fetches each session. It also supports filtering and pagination.
-   `revokeAllUserSessions(userId, exceptSessionId)`: A powerful security feature. It revokes all of a user's sessions, for instance, after a password change. It can optionally spare the current session that initiated the action.
-   `extendSession(sessionId)`: Resets the expiration timer for a session, keeping the user logged in because they are still active.

#### Monitoring and Health

-   `cleanupExpiredSessions()`: The method called by the background job to iterate through sessions and remove expired ones.
-   `getMetrics()`: Exposes the `SessionMetrics` object for monitoring dashboards.
-   `getHealthStatus()`: A vital function for a production system. It checks if it can successfully connect to Redis and reports its status, allowing for automated health checks and alerts.

#### Private Helper Methods

-   `getSessionKey(sessionId)` & `getUserSessionsKey(userId)`: These methods standardize the way Redis keys are generated, preventing inconsistencies.
-   `isSessionExpired(session)`: A simple utility to check if a session's expiration date is in the past.
-   `updateMetricsForCreation()` & `updateMetricsForDeletion()`: Internal methods to keep the monitoring data accurate.

### 3. Factory and Utility Functions: Enhancing Usability

-   **Factory Functions (`create...`)**: These provide a convenient way to create instances of the service or its configurations, pre-filled with default values from environment variables.
-   **Utility Functions (`isSessionValid`, `getSessionAge`, etc.)**: These are pure, stateless functions that provide helpful logic for working with session objects. They promote code reuse and make the calling code more readable.

## The Grand Picture: How It All Works Together

1.  A user logs in via an API endpoint.
2.  The authentication controller verifies the user's credentials.
3.  The controller calls `jwtTokenService.createToken()` to generate JWTs.
4.  The controller then calls `redisSessionService.createSession()`, passing in the user's ID and details about the request (IP, User-Agent).
5.  The `redisSessionService` creates a session in Redis and returns the `AuthSession` object, which might contain tokens or other session-specific data.
6.  This session information is sent back to the user.
7.  On subsequent requests, an API middleware verifies the user's JWT. It can then use the `sessionId` from the JWT payload to call `redisSessionService.getSession(sessionId)`.
8.  This allows the middleware to check if the session is still valid and active in Redis, providing an extra layer of security. If a user's JWT is stolen, it becomes useless as soon as the corresponding session is revoked in Redis.

## Conclusion: A Masterclass in Secure, Scalable Architecture

The `redis-session.service.ts` file is a testament to thoughtful, enterprise-grade software design. It solves the complex problem of session management with an elegant, scalable, and secure solution. By leveraging the power of Redis for speed and a clean, well-documented class structure for maintainability, it provides a solid foundation for the entire JobSwipe platform. For any developer, understanding the patterns and principles within this file is a significant step toward mastering the art of building robust backend systems.
