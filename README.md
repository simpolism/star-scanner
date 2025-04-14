# Star Scanner

A tool for finding and visualizing significant astrological events between outer planets.

## Development

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Run both with Netlify CLI
cd .. && netlify dev
```

## Production Build

```bash
# Build frontend and backend
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Project Structure

- `frontend/` - Svelte TypeScript frontend
- `backend/` - Node.js backend with Netlify functions
- `packages/` - Shared code packages

## Configuration

- Frontend environment variables: `frontend/.env`
- Backend configuration: `backend/src/constants.ts`
