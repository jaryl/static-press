# Static Press API Packages

This directory contains the serverless function packages that make up the Static Press API backend. Each subdirectory represents a distinct API endpoint or functional group.

These packages are designed to be deployed as individual serverless functions (e.g., using DigitalOcean Functions, AWS Lambda, etc.). The deployment configuration is managed by the `project.yml` file in the root directory.

## Packages

### 1. `auth`

-   **Purpose:** Handles user authentication.
-   **Functions:**
    -   `login`: Processes login requests (`/api/auth/login`) and issues JWTs.

### 2. `collections`

-   **Purpose:** Manages content collections (e.g., blog posts, pages).
-   **Functions:**
    -   `show`: Handles updating (PUT) collection data (`/api/collections/{collectionId}`). *(Requires Authentication)*

### 3. `schema`

-   **Purpose:** Manages the content structure definition (`schema.json`).
-   **Functions:**
    -   `show`: Handles reading (GET) the main `schema.json` file (`/api/schema/show`). *(Requires Authentication)*
    -   `metadata`: Retrieves metadata about `schema.json`, including modification time and public accessibility (`/api/schema/metadata`). *(Requires Authentication)*
    -   `presigned-url`: Generates a temporary, secure URL to view the `schema.json` content (`/api/schema/presigned-url`). *(Requires Authentication)*
    -   `make-private`: Sets the `schema.json` object's access control to private (`/api/schema/make-private`). *(Requires Authentication)*

## Building

Each package contains its own `package.json` with a `build` script (usually using `esbuild`) to bundle the handler code and dependencies into a deployable format (e.g., `index.js`). Refer to the `project.yml` file for specific build outputs and function entry points.

## Deployment

Deployment is handled via the project's deployment configuration (`project.yml`), which specifies the runtime, environment variables, and functions for each package.
