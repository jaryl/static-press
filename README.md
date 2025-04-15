<div align="center">
  <h1>Static Press</h1>
  <p>A modern headless CMS that deploys as a static site - no traditional backend required</p>

  <p>
    <a href="https://github.com/jaryl/static-press/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/jaryl/static-press" alt="License">
    </a>
    <a href="https://cloud.digitalocean.com/apps/new?repo=https://github.com/jaryl/static-press/tree/main&refcode=3eb491dbdfc1">
      <img src="https://img.shields.io/badge/DigitalOcean-Deploy-0080FF?logo=digitalocean" alt="Deploy to DigitalOcean">
    </a>
    <small><i>(Referral link - supports project development)</i></small>
  </p>
</div>

## Why Static Press?

Traditional content management systems typically require a backend server with a database, leading to ongoing hosting costs and maintenance overhead. Static Press takes a different approach:

- **Cost-Effective**: Deploy as a static site with serverless functions - pay only for what you use
- **Simple Architecture**: Uses S3-compatible storage instead of traditional databases
- **Non-Technical User Friendly**: Clean, intuitive interface for content editors
- **Perfect For**: Marketing sites, corporate websites, and other content-focused sites that need occasional updates

Static Press is designed for teams who need a lightweight CMS solution for mostly static websites that require periodic content updates by non-technical users, without the complexity and cost of traditional CMS platforms.

## Static Press vs Headless CMS or Static Site Generators

**Static Site Generators** (like Gatsby, Hugo, Jekyll) build websites at deploy time, converting source files into static HTML, CSS, and JavaScript. They're great for developers but typically lack user-friendly interfaces for content editors.

**Traditional Headless CMS** platforms (like Contentful, Strapi) provide content management interfaces and APIs but still require running and maintaining backend servers and databases, which means ongoing infrastructure costs.

**Static Press** takes a different approach:
- **Complementary to Static Site Generators**: Static Press manages content as JSON files that can be consumed by any static site generator
- **Like Headless CMS**: Provides a user-friendly interface for non-technical users to manage content
- **Unlike Traditional CMS**: Uses serverless functions and S3 storage for content management operations, eliminating the need for always-on servers while maintaining content editing capabilities

This approach gives you the flexibility to use your preferred static site generator while providing a simple, cost-effective way for non-technical users to manage content without the overhead of traditional server infrastructure.

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
- [Integration Examples](#-integration-examples)
- [Acknowledgements](#-acknowledgements)

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

## 🔌 Integration Examples

Static Press generates JSON content that is stored in your S3 bucket and can be easily consumed by any static site generator. There's no direct dependency between your static site and Static Press - the integration boundary is simply JSON files in your bucket:

```javascript
// Example: Fetching Static Press content in a Next.js page
export async function getStaticProps() {
  const res = await fetch('https://your-space-name.sgp.digitaloceanspaces.com/collections/blog.json')
  const posts = await res.json()

  return {
    props: { posts },
    revalidate: 60 // Revalidate at most once per minute
  }
}
```

```javascript
// Example: Using Static Press content in a Gatsby site
exports.createPages = async ({ actions }) => {
  const { createPage } = actions
  const response = await fetch('https://your-space-name.sgp.digitaloceanspaces.com/collections/products.json')
  const products = await response.json()

  products.forEach(product => {
    createPage({
      path: `/product/${product.slug}`,
      component: require.resolve('./src/templates/product.js'),
      context: { product },
    })
  })
}
```

## 🙏 Acknowledgements

Static Press stands on the shoulders of giants:

- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [AWS S3](https://aws.amazon.com/s3/) / [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/) - Storage
- [Express](https://expressjs.com/) - Development server
- [lovable.dev](https://lovable.dev) - Development inspiration
- [Windsurf](https://windsurf.com/refer?referral_code=91db5694eb) - Deployment platform *(Referral link - supports project development)*
