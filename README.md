<div align="center">
  <h1>Static Press</h1>
  <p>A modern headless CMS with a clean React UI and serverless API functions</p>

  <p>
    <a href="https://github.com/jaryl/static-press/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/jaryl/static-press" alt="License">
    </a>
    <a href="https://cloud.digitalocean.com/apps/new?repo=https://github.com/jaryl/static-press/tree/main&refcode=3eb491dbdfc1">
      <img src="https://img.shields.io/badge/DigitalOcean-Deploy-0080FF?logo=digitalocean" alt="Deploy to DigitalOcean">
    </a>
  </p>
</div>

## ✨ Features

- 🖥️ **Modern Admin Interface** - Built with React, Tailwind CSS, and shadcn/ui
- 🚀 **Serverless Ready** - API functions for schema and collection management
- 📦 **S3 Storage** - Persistent data storage with S3 compatibility
- 📱 **Responsive Design** - Table interface with horizontal scrolling support
- 🔄 **Hybrid Architecture** - Express for development, Serverless for production

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- S3-compatible storage (AWS S3, DigitalOcean Spaces, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/jaryl/static-press.git

# Navigate to the project directory
cd static-press

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your S3 credentials

# Start the development server
npm run dev
```

## 🏗️ Project Structure

```
static-press/
├── core/                # Shared business logic
│   └── handlers/        # Core API handlers
├── packages/            # Serverless functions
│   └── default/         # DigitalOcean Functions
├── server/              # Express development server
│   └── api/             # API routes
├── src/                 # Frontend React application
│   ├── components/      # UI components
│   ├── lib/             # Utility functions
│   └── pages/           # Application pages
└── .do/                 # DigitalOcean deployment config
```

## 🚢 Deployment

### One-Click Deploy to DigitalOcean

Deploy Static Press to DigitalOcean App Platform with a single click:

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/jaryl/static-press/tree/main&refcode=3eb491dbdfc1)

This will:
- Deploy the frontend as a static site
- Deploy the serverless functions for API endpoints
- Prompt you to configure your S3 credentials

### Manual Deployment

You can also deploy Static Press manually:

1. Build the frontend: `npm run build`
2. Deploy the `dist` directory to any static hosting service
3. Deploy the `packages` directory to a serverless platform

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_USE_REMOTE_DATA` | Set to 'true' to use remote data storage | Yes |
| `VITE_API_BASE_URL` | API endpoint URL (e.g., http://localhost:3001/api) | Yes |
| `VITE_S3_ENDPOINT_URL` | S3 endpoint URL | Yes |
| `VITE_S3_BUCKET_NAME` | S3 bucket name | Yes |
| `S3_REGION` | S3 region | Yes |
| `S3_ACCESS_KEY_ID` | S3 access key | Yes |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | Yes |

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
