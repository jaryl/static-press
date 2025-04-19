# Development API Server

This directory contains a simple Express.js API server intended **only for local development**.

Its primary purpose is to provide a local endpoint that mimics the behavior of deployed serverless functions (e.g., on DigitalOcean Functions), allowing the frontend application (`../app`) to interact with an API during development without needing deployed resources.

**Do not deploy this server.**

## Structure

-   `index.ts`: The main Express server setup, including middleware registration and route mounting.
-   `api/`: Contains Express Routers for specific API resources:
    -   `schema.ts`: Handles routes under `/api/schema/*`.
    -   `collection.ts`: Handles routes under `/api/collections/*`.
-   `middleware/`: Contains custom Express middleware:
    -   `auth.ts`: Handles JWT authentication for protected routes.
    -   `errorHandler.ts`: Provides centralized error handling for API routes.
-   Imports shared business logic and configuration from the parent `lib/` directory (`lib/api-logic`, `lib/config`, `lib/utils`).

## Configuration

The server relies on environment variables for configuration, loaded via `../lib/config.ts`. These are typically set in a `.env` file in the project root (`../.env`).

**Required:**

-   `VITE_S3_BUCKET_NAME`: The name of the S3 bucket used for storage.
-   `JWT_SECRET`: The secret key used for signing and verifying JWT tokens.
-   `VITE_DEV_SERVER_URL`: The full URL (including port) of the frontend Vite development server (e.g., `http://localhost:8080`) for CORS configuration.

**Optional:**

-   `API_PORT`: The port for the API server to listen on (defaults to `3001`).
-   `PRESIGNED_URL_EXPIRY_SECONDS`: Expiration time for generated S3 presigned URLs (defaults to `3600`).

## Running the Server

You can typically run the server using a script defined in the root `package.json`, for example:

```bash
# Navigate to the project root directory
cd ..

# Run the dev API server (adjust command based on package manager and script name)
npm run dev:api
```

The server will log its listening port, allowed CORS origin, and the S3 bucket name upon successful startup.
