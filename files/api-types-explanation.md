# Documentation: `api.ts`

## Introduction: The Professor's Guide to the Language of Our API

Welcome, students, to a foundational lecture on `api.ts`. This is arguably one of the most critical files in our entire shared codebase. It is not a file that contains logic; it does not *do* anything. Instead, it *defines* everything. This file is our **API's dictionary, grammar, and rulebook**. It establishes the standardized language that our frontend (web and desktop) and backend will use to communicate with each other.

By creating a single, shared source of truth for all API-related data structures, we achieve several paramount objectives in software engineering:

1.  **Type Safety:** Both the frontend and backend are built using the same set of TypeScript types. This means a change in the API's data structure on the backend will immediately cause a compile-time error on the frontend, preventing a whole class of bugs long before they reach production.
2.  **Consistency:** Every single response from our API will have the same predictable shape. This makes frontend development faster, easier, and more reliable.
3.  **Clarity and Documentation:** This file serves as living, breathing documentation for our API. A new developer can look at this file and immediately understand the structure of our API responses, the possible errors, and the shape of complex data like search results.

Think of this file as the Rosetta Stone of the JobSwipe platform. It allows disparate parts of our system to speak the same language fluently and without misunderstanding.

## Core Concepts: The Pillars of a Well-Defined API

### The Standard API Response Wrapper

At the heart of our API design is the `ApiResponse<T>` interface. Every single response from our server, whether successful or not, will conform to this structure:

```typescript
export interface ApiResponse<T = any> {
  success: boolean; // Was the operation successful?
  data?: T;          // The actual data payload if successful.
  error?: string;    // A human-readable error message if it failed.
  errorCode?: string;// A machine-readable error code if it failed.
  timestamp: Date;  // When the response was generated.
  // ... other metadata
}
```

This standardized wrapper is incredibly powerful. It means the frontend can have a single, unified way of handling any API response. It can check `response.success`, and if it's `true`, it can safely access `response.data`. If it's `false`, it knows it can find a user-friendly message in `response.error`.

### Enumerations for Clarity

This file makes extensive use of TypeScript `enum` (enumerations). An enum is a way of creating a named set of constant values. For example, instead of using raw numbers like `404` or magic strings like `"NOT_FOUND"`, we use `HttpStatus.NOT_FOUND` and `ApiErrorCode.NOT_FOUND`. This has several advantages:

-   **Readability:** `if (errorCode === ApiErrorCode.TOKEN_EXPIRED)` is infinitely more readable than `if (errorCode === "1002")`.
-   **Discoverability:** With modern IDEs, a developer can simply type `ApiErrorCode.` and see a list of all possible, valid error codes.
-   **Maintainability:** If we need to change an error code, we only need to change it in one place—the enum definition.

### Zod for Runtime Validation

While TypeScript gives us compile-time type safety, it does not protect us at runtime. A client could still send a malformed request body. This is where **Zod** comes in. This file defines Zod schemas (`ApiResponseSchema`, `SearchRequestSchema`, etc.) that mirror the TypeScript interfaces. The backend can use these schemas to parse and validate incoming request data, ensuring that it strictly conforms to the expected shape before any logic is executed. This is a critical security and stability measure.

---

## An In-Depth Tour of `api.ts`

Let's break down the file into its logical sections.

### 1. Standard API Response Types

This is the foundation. It defines the core `ApiResponse` wrapper and specialized versions of it:

-   `PaginatedApiResponse<T>`: For responses that return a list of items, this extends the base response to include pagination metadata (like total pages, current page, etc.).
-   `ApiErrorResponse` & `ApiSuccessResponse<T>`: These are more specific types that make it even clearer whether a response represents a success or a failure, improving type inference in the frontend code.

### 2. HTTP Status Codes

-   `HttpStatus`: An exhaustive enum of standard HTTP status codes. This prevents developers from using incorrect or non-standard codes and serves as a quick reference.

### 3. Error Types: A Taxonomy of Failure

This is one of the most valuable sections for a developer.

-   `ApiErrorCode`: This enum provides a comprehensive, categorized list of every possible *business logic* error that can occur in our application. It covers everything from `TOKEN_EXPIRED` to `RATE_LIMIT_EXCEEDED` to `EXTERNAL_SERVICE_ERROR`. This structured approach to error handling is a hallmark of a mature application.
-   `ApiError`: A custom error class that extends the built-in `Error` class. It standardizes the way we create and throw errors within the backend, ensuring that every error has not just a message, but also a `code`, an appropriate `statusCode`, and optional `details`.

### 4. Specialized Response Types

This section defines the specific shapes for common, complex API responses.

-   `ValidationErrorResponse`: Defines the exact structure of the response when input validation fails, including an array of which fields were invalid and why.
-   `RateLimitResponse`: Defines the response when a user is rate-limited, including information about when they can try again.

### 5. Domain-Specific Types

This section defines the data structures for major features of our application.

-   **`HealthCheck` Types**: Defines the rich data structure for our API's health check endpoint. This allows for detailed, automated monitoring of the application's status, including its database connections, memory usage, and CPU load.
-   **`Webhook` Types**: Defines the contract for webhook events, ensuring that any system consuming our webhooks knows exactly what to expect.
-   **`BulkOperations` Types**: Defines the request and response shapes for performing operations (like create, update, delete) on many items at once.
-   **`Search` Types**: Defines the powerful and complex structures for search queries and results, including support for filtering, sorting, pagination, and aggregations (facets).

### 6. Validation Schemas (Zod)

As mentioned, this section provides the Zod schemas that correspond to our TypeScript interfaces. These are used on the backend to validate incoming data at the edge of the system.

### 7. Helper Functions: Convenience and Consistency

This final section provides a set of utility functions for working with the types defined in this file.

-   `createSuccessResponse()`, `createErrorResponse()`, etc.: These are factory functions that ensure all API responses are created in a consistent way across the entire backend codebase.
-   `isSuccessResponse()`, `isErrorResponse()`: These are **type guards**. They are a powerful TypeScript feature that allows us to narrow down the type of a response object within a conditional block, enabling static analysis and autocompletion.

## The Grand Picture: A Contract of Steel

Imagine our frontend and backend are two separate companies that need to do business. This `api.ts` file is the legally binding contract they both sign. The backend promises, "Every response I send you will look exactly like this." The frontend promises, "Every request I send you will look exactly like this."

Because this "contract" is written in TypeScript and shared across both projects, the compiler becomes the lawyer, enforcing the contract at all times. This eliminates a massive source of potential runtime errors, makes development faster and more predictable, and provides a single, unambiguous source of truth for how our entire distributed system communicates.

## Conclusion: A Masterclass in API Design

The `api.ts` file is a testament to a mature, professional approach to software architecture. It demonstrates a commitment to type safety, consistency, and clear documentation. It is the bedrock upon which a stable, scalable, and maintainable API is built. For any developer, new or experienced, a deep understanding of the principles and patterns in this file is a crucial step toward mastering the art of building large-scale, distributed applications.