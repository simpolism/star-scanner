# AStrological Inferences (ASI) 2017

A tool for finding significant astrological events between outer planets.

## Features

- Detects planetary ingresses (sign changes)
- Tracks retrograde motion
- Identifies major aspects between planets
- Generates JSON data file with events
- Provides a static HTML viewer for easy visualization

## Usage

```
# Install dependencies
npm install

# Build and generate event data
npm run build

# The above will:
# 1. Generate JSON data in public/data/
# 2. Create a static site in the public/ directory
```

## Viewing Results

After running the build, run `npx serve public` in your browser to view the events.

To modify the HTML visualization:
1. Edit files in the `public/` directory
2. Refresh your browser to see changes (no need to regenerate data)

## Deployment

The project is Netlify-ready:
```
# Deploy to Netlify
npm run deploy
```

To customize the time period or tracked planets, edit `src/constants.ts`.
