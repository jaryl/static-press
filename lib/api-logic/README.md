# Shared API Logic

This directory contains shared logic for handling API requests related to specific resources (e.g., schemas, collections).

This logic is designed to be reusable and is imported by:

1.  The local development API server (`dev-api`).
2.  The deployed serverless functions (`packages/...`).

Keeping the core handler logic separate ensures consistency between the development environment and the production deployment.
