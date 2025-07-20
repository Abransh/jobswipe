# Documentation: `auth.context.tsx`

## Introduction

This document provides a detailed explanation of the `auth.context.tsx` file. This file is the cornerstone of the authentication system for the JobSwipe platform's frontend applications. It uses React's Context API to provide a centralized and easily accessible way to manage user authentication state and actions throughout the entire application.

This explanation is aimed at new developers to help them understand the authentication flow and how to interact with it.

## Core Concepts

Before diving into the code, let's understand a few core concepts being used.

### React Context API

Imagine you have some data (like the current user's information) that many different components in your application need to access. Normally, you would have to pass this data down from a parent component to its children, and then to its grandchildren, and so on. This is called "prop drilling" and can become very messy.

The React Context API provides a way to share this data across the entire component tree without having to pass props down manually at every level. We create a `Provider` component that holds the data, and any component that needs the data can become a `Consumer` to access it.

### `'use client'`

This is a directive from Next.js. It declares that this file and its components are "Client Components". This means they will be rendered on the user's browser, not on the server. This is essential for a file like this because authentication is inherently interactive and relies on browser features like `window`, `localStorage`, and handling user input.

### `FrontendAuthService`

This file (`auth.context.tsx`) is responsible for managing the *state* of authentication in the UI. However, the actual work of talking to the backend API (like sending login requests, handling tokens, etc.) is done by the `FrontendAuthService`. This separation of concerns is good practice, as it keeps the UI logic separate from the API communication logic.

---

## File Breakdown

### 1. Interfaces

Interfaces in TypeScript define the "shape" of an object. They ensure that our data structures are consistent.

#### `AuthContextValue`

This is the most important interface in the file. It defines everything that the `AuthContext` will provide to the components that consume it.

-   **Auth State:**
    -   `user: AuthenticatedUser | null;`: Holds the logged-in user's data, or `null` if no one is logged in.
    -   `isAuthenticated: boolean;`: A simple `true` or `false` flag indicating if the user is logged in.
    -   `isLoading: boolean;`: `true` when the authentication status is being checked (e.g., on page load or during login). This is useful for showing loading spinners.
    -   `error: string | null;`: Holds any authentication-related error message.

-   **Auth Actions:** These are the functions that components can call to perform authentication-related tasks.
    -   `login`, `register`, `logout`, `refreshToken`: Core authentication functions.
    -   `clearError`: A function to clear any existing error message.

-   **OAuth Actions:**
    -   `loginWithOAuth`: Redirects the user to an OAuth provider (like Google or GitHub) to sign in.
    -   `handleOAuthCallback`: Handles the response from the OAuth provider after the user signs in.

-   **Profile & Password Actions:**
    -   `updateProfile`, `requestPasswordReset`, `resetPassword`: Functions for managing the user's profile and password.

### 2. Context Creation

```typescript
const AuthContext = createContext<AuthContextValue | null>(null);
```

This line creates the actual `AuthContext`. It's initialized with `null`, but the `AuthProvider` will provide the real value.

### 3. `AuthProvider` Component

This is the main component that you will wrap around your application. It does all the heavy lifting.

```jsx
export function AuthProvider({ children, config }: AuthProviderProps) {
  // ... logic ...
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

-   **Props:** It takes `children` (which will be the rest of your application) and an optional `config` object for the `FrontendAuthService`.
-   **State:** It uses `React.useState` to manage the `authState` (the user, `isAuthenticated`, etc.).
-   **Action Implementations:** It defines the functions (`login`, `logout`, etc.) that were promised in the `AuthContextValue` interface. These functions are wrapped in `React.useCallback` for performance optimization, preventing them from being recreated on every render. These functions call the corresponding methods in the `authService`.
-   **`useEffect` Hooks:**
    -   The first `useEffect` simply sets a flag `isClient` to `true`. This is a trick to know when the component has mounted on the client-side and can safely access browser APIs.
    -   The second `useEffect` is crucial. It runs only on the client-side.
        1.  It **subscribes** to the `authService`. This means whenever the authentication state changes inside the service (e.g., user logs out), the service will notify this `AuthProvider`, which will then update its state and re-render the application with the new auth status.
        2.  It calls `authService.initialize()`. This function is responsible for checking if there's an existing session (e.g., from a token stored in `localStorage`) when the application first loads.
-   **SSR Handling:** It cleverly handles Server-Side Rendering (SSR). Before the component has mounted on the client (`!isClient`), it shows a loading indicator. This prevents mismatches between the server-rendered and client-rendered HTML.
-   **Providing the Value:** Finally, it uses `<AuthContext.Provider>` to make the `contextValue` (which contains the auth state and all the action functions) available to all components rendered within it.

### 4. Custom Hooks

While you could use `useContext(AuthContext)` directly in your components, this file provides a set of custom hooks to make accessing the context cleaner and safer.

#### `useAuth()`

This is the primary hook. It's the main way you'll interact with the authentication system.

```jsx
const { user, login, logout, isAuthenticated, isLoading } = useAuth();
```

It handles the case where a component tries to use it without being wrapped in an `AuthProvider`, throwing a helpful error. It also provides safe, non-functional defaults during Server-Side Rendering.

#### Specialized Hooks

These hooks are provided for convenience and to improve performance and code clarity. For example, if a component only needs to know if the user is authenticated, it can use `useIsAuthenticated()` instead of `useAuth()`. This prevents the component from re-rendering unnecessarily when other parts of the auth state (like `isLoading`) change.

-   `useAuthState()`: Gets only the state values (`user`, `isAuthenticated`, etc.).
-   `useUser()`: Gets only the `user` object.
-   `useIsAuthenticated()`: Gets only the `isAuthenticated` boolean.
-   `useLogin()`, `useRegister()`, `useLogout()`: Hooks that return a specific action function along with its loading and error state.

### 5. Higher-Order Components (HOCs)

HOCs are functions that take a component and return a new, enhanced component.

#### `withAuth(Component, options)`

This HOC is used to protect routes. If you wrap a component with `withAuth`, it will only be rendered if the user is authenticated. If they are not, it will redirect them to the login page (`/auth/signin` by default).

**Example:**
`export default withAuth(DashboardPage);`

#### `withGuest(Component, options)`

This is the opposite of `withAuth`. It's for pages that should only be seen by unauthenticated users, like the login or registration pages. If an authenticated user tries to access a page wrapped with `withGuest`, they will be redirected to the dashboard (`/dashboard` by default).

**Example:**
`export default withGuest(LoginPage);`

### 6. Utility Components

These are regular React components that conditionally render their children based on the authentication state. They offer a more declarative way to show or hide UI elements compared to writing `if/else` logic in your JSX.

#### `<AuthRequired>`

Renders its children only if the user is authenticated.

```jsx
<AuthRequired>
  <p>This is only visible to logged-in users.</p>
</AuthRequired>
```

#### `<GuestOnly>`

Renders its children only if the user is a guest (not authenticated).

```jsx
<GuestOnly>
  <p>This is only visible to guests.</p>
</GuestOnly>
```

---

## How to Use

1.  **Wrap your application:** In your main layout or root file (e.g., `src/app/layout.tsx` in Next.js), wrap your application with the `AuthProvider`.

    ```jsx
    import { AuthProvider } from '@jobswipe/shared/src/context/auth.context';

    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <body>
            <AuthProvider>
              {children}
            </AuthProvider>
          </body>
        </html>
      );
    }
    ```

2.  **Access auth state and actions:** In any component, use the `useAuth` hook or one of the specialized hooks.

    ```jsx
    import { useAuth } from '@jobswipe/shared/src/context/auth.context';

    function MyComponent() {
      const { user, logout, isAuthenticated } = useAuth();

      if (!isAuthenticated) {
        return <p>Please log in.</p>;
      }

      return (
        <div>
          <p>Welcome, {user?.email}!</p>
          <button onClick={logout}>Log Out</button>
        </div>
      );
    }
    ```

3.  **Protect pages:** Use the `withAuth` HOC to protect pages that require a user to be logged in.

    ```jsx
    import { withAuth } from '@jobswipe/shared/src/context/auth.context';

    function Dashboard() {
      // ...
    }

    export default withAuth(Dashboard);
    ```

## Conclusion

The `auth.context.tsx` file provides a robust, full-featured, and easy-to-use system for managing authentication in the JobSwipe frontend. By centralizing the logic in a service and the state in a React Context, it creates a clean, maintainable, and scalable solution. The inclusion of custom hooks, HOCs, and utility components makes interacting with the authentication system both simple and powerful.
