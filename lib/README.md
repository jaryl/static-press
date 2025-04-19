# Library (`lib`)

This directory contains shared backend logic, utilities, and configuration used across the Static Press application, including the local development API server and the deployed serverless functions.

## Structure

-   **`api-logic/`**: Contains the core business logic for handling API requests related to specific resources (e.g., schemas, collections, authentication).
    -   `handlers/`: Resource-specific request handlers (e.g., `getSchema`, `updateCollection`). Logic here is decoupled from specific S3 SDK calls.
    -   `utils/`: Utilities specifically for formatting API responses (`response.ts`).
-   **`utils/`**: Contains general-purpose utility functions shared across the backend.
    -   `logger.ts`: Standardized logging utility.
    -   `s3Utils.ts`: Helper functions for interacting with AWS S3, abstracting SDK calls and client usage.
    -   `stream.ts`: Utility for converting Readable streams to strings.
-   **`config.ts`**: Handles loading, validating, and providing environment variables and application configuration.
-   **`s3Client.ts`**: Initializes and exports the AWS S3 client instance (primarily used by `s3Utils.ts`).

Keeping the core handler logic (`api-logic`) separate from general utilities (`utils`) and infrastructure setup (`config.ts`, `s3Client.ts`) promotes modularity and ensures consistency between the development environment and the production deployment.
