# Development API Server

This directory contains a simple API server (e.g., using Express) intended **only for local development**.

Its primary purpose is to mock backend API calls that would normally be handled by deployed serverless functions (e.g., on DigitalOcean Functions).

**Do not deploy this server.**

It typically imports shared API logic from `src/utils/api-logic` to handle mocked requests.
