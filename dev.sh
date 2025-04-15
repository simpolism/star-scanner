#!/bin/bash

# Development script for star-scanner using Git Bash
# Watches frontend and backend directories for changes and rebuilds as needed

# Function to build the frontend
build_frontend() {
  echo "Building frontend..."
  cd frontend && npm run build
  cd ..
  echo "Frontend build complete"
}

# Function to build the backend
build_backend() {
  echo "Building backend..."
  cd backend && npm run build
  cd ..
  echo "Backend build complete"
}

# Save current directory
ROOT_DIR=$(pwd)

# Initial builds
build_frontend
build_backend

# Initialize hash files
mkdir -p .watch_cache
find frontend/src -type f -name "*.*" | sort | xargs sha1sum > .watch_cache/frontend.hash
find backend/src -type f -name "*.*" | sort | xargs sha1sum > .watch_cache/backend.hash

# Start Netlify Dev in background
netlify dev &
NETLIFY_PID=$!

# Watch for changes
while true; do
  # Check frontend
  find frontend/src -type f -name "*.*" | sort | xargs sha1sum > .watch_cache/frontend_new.hash
  if ! cmp -s .watch_cache/frontend.hash .watch_cache/frontend_new.hash; then
    echo "Frontend changes detected"
    build_frontend
    mv .watch_cache/frontend_new.hash .watch_cache/frontend.hash
  fi

  # Check backend
  find backend/src -type f -name "*.*" | sort | xargs sha1sum > .watch_cache/backend_new.hash
  if ! cmp -s .watch_cache/backend.hash .watch_cache/backend_new.hash; then
    echo "Backend changes detected"
    build_backend
    mv .watch_cache/backend_new.hash .watch_cache/backend.hash
  fi

  # Sleep to avoid excessive CPU usage
  sleep 2
done

# Cleanup on exit (unreachable in normal execution, but good practice)
trap "kill $NETLIFY_PID; rm -rf .watch_cache" EXIT
