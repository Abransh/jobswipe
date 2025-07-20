# Documentation: `frontend-auth.service.ts`

## Introduction

This document explains the `frontend-auth.service.ts` file. This service is the engine that powers the authentication functionality for JobSwipe's frontend applications. While `auth.context.tsx` provides the state management layer for the UI, this service handles the direct communication with the backend API, manages tokens, and contains the core authentication logic.

This explanation is designed for new developers to understand how the frontend communicates with the backend for authentication.

## Core Concepts

### Separation of Concerns

This file is a great example of the "Separation of Concerns" principle. The UI (React components) doesn't know *how* to talk to the API. It just knows it can call `login()` from the `useAuth` hook. This service is the implementation of `login()` that actually makes the network request.

### Singleton Pattern

This service is implemented as a **singleton**. This means that no matter how many times you ask for an instance of the `FrontendAuthService`, you will always get the *exact same object*. This is important because we only want one central place managing the authentication state and timers for token refreshes.

### Token-Based Authentication

The service uses JSON Web Tokens (JWTs) for authentication. The flow is as follows:
1.  User logs in with credentials.
2.  The server validates the credentials and sends back two tokens:
    *   **Access Token:** A short-lived token (e.g., 15 minutes) that is sent with every API request to prove the user is authenticated.
    *   **Refresh Token:** A long-lived token (e.g., 30 days) that is used to get a new access token when the old one expires.
3.  The service stores these tokens securely.
4.  Before the access token expires, the service automatically uses the refresh token to get a new one, keeping the user logged in seamlessly.

---

## File Breakdown

### 1. Interfaces & Types

-   **`AuthState`**: Defines the shape of the authentication state object, including the user, session, and loading/error status. This is the same state that the `AuthProvider` in `auth.context.tsx` will manage.
-   **`AuthConfig`**: Defines the configuration options for the service, such as the API base URL and token storage keys.
-   **`TokenStorage`**: An interface that defines the contract for how tokens should be stored and retrieved. This allows us to easily swap out the storage mechanism (e.g., for testing or different environments) without changing the service logic.

### 2. `SecureTokenStorage` Class

This class is the concrete implementation of the `TokenStorage` interface. It's responsible for the actual reading and writing of tokens to the browser's storage.

-   **Storage Strategy:** It attempts to use the most secure storage available. In a production environment, tokens (especially refresh tokens) should be stored in `HttpOnly` cookies, which are not accessible via JavaScript, to prevent Cross-Site Scripting (XSS) attacks. This class has fallbacks to `sessionStorage` (for access tokens) and `localStorage` (for refresh tokens) for development or environments where `HttpOnly` cookies are not used.
-   **`getAccessToken()`, `setAccessToken()`, etc.:** Methods for getting, setting, and clearing the access and refresh tokens.
-   **`isTokenExpired(token)`:** A crucial utility function that decodes a JWT and checks its `exp` (expiration) claim to see if it has expired.

### 3. `FrontendAuthService` Class

This is the main class and the heart of the file.

#### Constructor & Properties

-   `constructor(config)`: Initializes the service with a configuration and creates an instance of the `SecureTokenStorage`.
-   `private authState`: Holds the current authentication state.
-   `private listeners`: An array of functions. This is part of the observer pattern. When the auth state changes, the service calls all the functions in this array to notify them of the change. The `AuthProvider` is one of these listeners.

#### Public Methods (The API of the Service)

These are the methods that the `AuthProvider` calls.

-   `initialize()`: Called when the app loads. It checks for existing tokens and tries to authenticate the user automatically.
-   `login(email, password)`: Sends a `POST` request to the `/auth/login` endpoint.
-   `register(registerData)`: Sends a `POST` request to the `/auth/register` endpoint.
-   `logout()`: Sends a `POST` request to the `/auth/logout` endpoint to invalidate the session on the server, and then clears all local tokens and state.
-   `refreshAccessToken()`: Sends the refresh token to the `/auth/refresh` endpoint to get a new access token.
-   `getAuthState()`: Returns the current `authState` object.
-   `subscribe(listener)`: Allows other parts of the app (like the `AuthProvider`) to listen for state changes.
-   `getOAuthUrl(provider)`: Constructs the URL to redirect the user to for OAuth-based login.
-   `handleOAuthCallback(...)`: Handles the callback from the OAuth provider after a user authenticates.

#### Private Methods (Internal Logic)

These methods are used internally by the service to perform its duties.

-   `initializeAuthState()`: The core logic for checking tokens on startup.
-   `handleSuccessfulAuth(response)`: A helper function called after a successful login or registration. It stores the new tokens and updates the auth state.
-   `scheduleTokenRefresh()`: A key method for a smooth user experience. It decodes the access token to find its expiration time and then uses `setTimeout` to schedule a call to `refreshAccessToken()` *before* it expires.
-   `makeAuthRequest(endpoint, options)`: A centralized method for making `fetch` requests to the backend. It automatically adds the `Authorization: Bearer <token>` header to every request.
-   `handleAuthError(error)`: A utility to standardize error handling.
-   `clearAuthState()`: Resets the state to its initial, unauthenticated values.
-   `setUser()`, `setAuthenticated()`, `setLoading()`, `setError()`: These are state mutators. They change a piece of the `authState` and then call `notifyListeners()`.
-   `notifyListeners()`: The method that loops through the `listeners` array and calls each listener function, passing them the new state. This is how the `AuthProvider` gets updated.

### 4. Default Configuration & Singleton Instance

-   **`defaultAuthConfig`**: Provides sensible default values for the service configuration.
-   **`getAuthService(config)`**: This is the function that ensures the service is a singleton. It checks if an `authServiceInstance` already exists. If it does, it returns it. If not, it creates a new one and saves it for future calls.

---

## How It Connects to `auth.context.tsx`

1.  The `AuthProvider` component calls `getAuthService()` to get the singleton instance of the `FrontendAuthService`.
2.  In a `useEffect` hook, the `AuthProvider` calls `authService.subscribe(setAuthState)`. This tells the service: "Hey, whenever your state changes, please call my `setAuthState` function with the new state."
3.  When a user clicks a login button, the component calls the `login` function from the `useAuth` hook.
4.  This `login` function is actually the one defined inside `AuthProvider`, which in turn calls `authService.login(email, password)`.
5.  The `authService` makes the API request. When the request is in progress, it calls `this.setLoading(true)`. This updates the internal `authState` and triggers the `notifyListeners()` method.
6.  The `AuthProvider`'s `setAuthState` function gets called with the new state (`isLoading: true`), causing the UI to re-render and show a loading spinner.
7.  When the API call finishes, `authService` calls `handleSuccessfulAuth()`, which updates the user and tokens, and then calls `this.setLoading(false)`.
8.  Again, `notifyListeners()` is called, the `AuthProvider` gets the final state (`isAuthenticated: true`, `user: {...}`), and the UI updates to show the authenticated view.

## Conclusion

The `frontend-auth.service.ts` file is a well-structured, robust service that encapsulates all the logic for frontend authentication. It effectively separates API communication and token management from the UI state layer, uses a singleton pattern to ensure a single source of truth, and provides a seamless user experience through automatic token refreshes. Understanding this service is key to understanding the complete authentication flow of the JobSwipe platform.
