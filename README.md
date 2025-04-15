# Static Press

A modern headless CMS with a clean React UI and serverless API functions.

## Features

- React-based admin interface with Tailwind CSS and shadcn/ui
- Serverless API functions for schema and collection management
- S3 storage backend for data persistence
- Responsive table interface with horizontal scrolling support
- DigitalOcean App Platform deployment support

## Getting Started

### Prerequisites

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone https://github.com/jaryl/static-press.git

# Step 2: Navigate to the project directory
cd static-press

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Project Structure

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Express.js (development server)
- DigitalOcean Functions (production)

## Deployment Options

### Deploy to DigitalOcean

You can deploy this project to DigitalOcean App Platform with a single click:

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/jaryl/static-press/tree/main&refcode=3eb491dbdfc1)

This will:
- Deploy the frontend as a static site
- Deploy the serverless functions for API endpoints
- Prompt you to configure your S3 credentials

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.
