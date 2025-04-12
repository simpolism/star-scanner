# Star Scanner

An astrological event viewer that tracks planetary movements, aspects, and configurations.

## Project Structure

- `packages/common`: Shared types and utilities
- `packages/backend`: Netlify functions and astronomy calculations
- `packages/frontend`: Next.js frontend application

## Development

### Prerequisites

- Node.js 16+
- npm 7+

### Setup

```bash
# Install dependencies for all packages
npm install

# Build packages in the correct order
npm run build
```

### Running Locally

```bash
# Start the backend server (Netlify Functions)
npm run dev:backend

# In another terminal, start the frontend
npm run dev:frontend
```

## Deployment

The application is deployed to Netlify. Push to the main branch to trigger deployment.

## License

MIT
