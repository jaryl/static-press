# Serverless Functions (DigitalOcean)

This directory contains the serverless functions structured specifically for deployment to DigitalOcean Functions.

- **`default/`**: This directory structure is often required by DigitalOcean App Platform or Functions.
  - **`collections/`**: Contains the DO Function handlers for API endpoints related to collection data (CRUD operations).
  - **`schema/`**: Contains the DO Function handlers for API endpoints related to collection schemas (CRUD operations).

These function handlers typically act as thin wrappers, importing and utilizing the shared request handling logic from `src/utils/api-logic`.
