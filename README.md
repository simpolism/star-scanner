# AStrological Inferences (ASI) 2017

A tool for finding significant astrological events between outer planets.

## Features

- Detects planetary ingresses (sign changes)
- Tracks retrograde motion
- Identifies major aspects between planets
- Generates HTML visualization

## Usage

```
npm install
npm run build
node dist/index.js
```

The tool will generate an HTML file `astrological-events.html` containing all detected events.

To customize the time period or tracked planets, edit `src/constants.ts`.
