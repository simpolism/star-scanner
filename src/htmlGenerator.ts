import { type AstrologicalEvent, EventProcessor } from './types';
import { COLORS, END_DATE, START_DATE } from './constants';
import fs from 'fs';

export const generateHtml = (
  events: AstrologicalEvent[],
  eventProcessors: Array<EventProcessor> = [],
): void => {
  if (!events.length) {
    console.log('No events found.');
    return;
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  console.log(`Found ${events.length} events. Generating HTML output...`);

  // Create HTML content
  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Astrological Events ${START_DATE.getFullYear()}-${END_DATE.getFullYear()}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    h1 {
      color: #444;
      border-bottom: 2px solid #444;
      padding-bottom: 10px;
    }
    .event-list {
      list-style-type: none;
      padding: 0;
    }
    .event-item {
      background-color: white;
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .major-event-item {
      background-color: #f8f8f8;
      margin-bottom: 8px;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #444;
      font-weight: bold;
    }
    .date {
      font-weight: bold;
      margin-right: 10px;
      min-width: 100px;
      display: inline-block;
    }
    .type {
      font-weight: bold;
      min-width: 120px;
      display: inline-block;
      margin-right: 10px;
    }
    /* ANSI color to CSS color conversion for planets */
    .planet-Sun { color: #e6b800; }
    .planet-Moon { color: #c0c0c0; }
    .planet-Mercury { color: #00b3b3; }
    .planet-Venus { color: #cc00cc; }
    .planet-Mars { color: #cc0000; }
    .planet-Jupiter { color: #0000cc; }
    .planet-Saturn { color: #666666; }
    .planet-Uranus { color: #00cccc; }
    .planet-Neptune { color: #0099ff; }
    .planet-Pluto { color: #cc66cc; }
    
    /* Sign colors */
    .sign-Aries, .sign-Leo, .sign-Sagittarius { color: #cc0000; }
    .sign-Taurus, .sign-Virgo, .sign-Capricorn { color: #006600; }
    .sign-Gemini, .sign-Libra, .sign-Aquarius { color: #e6b800; }
    .sign-Cancer, .sign-Scorpio, .sign-Pisces { color: #00b3b3; }
    
    /* Aspect colors */
    .aspect-conjunction { color: #ffffff; background-color: #333; padding: 0 3px; }
    .aspect-opposition { color: #cc0000; }
    .aspect-trine { color: #006600; }
    .aspect-square { color: #cc0000; }
    .aspect-sextile { color: #e6b800; }
    
    /* Event type colors */
    .type-aspect_end { color: #cc00cc; }
    .type-aspect_begin { color: #00cc00; }
    .type-ingress { color: #006600; }
    .type-retrograde { color: #e6b800; }
    .type-configuration { color: #00b3b3; }
  </style>
</head>
<body>
  <h1>Astrological Events ${START_DATE.getFullYear()}-${END_DATE.getFullYear()}</h1>
  <p>Total events found: ${events.length}</p>
  
  <ul class="event-list">`;
  for (const event of events) {
    const dateStr = event.date.toISOString().split('T')[0];

    // First, add special event processed output if present
    for (const processor of eventProcessors) {
      const processedOutput = processor(event);
      if (processedOutput) {
        htmlContent += `
          <li class="major-event-item">
            <span class="date">${dateStr}</span>
            <span class="special-event">${processedOutput}</span>
          </li>`;
      }
    }

    // Add the regular event
    const htmlType = `<span class="type type-${event.type}">${event.type.toUpperCase()}</span>`;

    // Replace ANSI colors with HTML spans
    let htmlDescription = event.description;

    // Add planet classes
    Object.keys(COLORS.PLANET_COLORS).forEach((planet) => {
      const regex = new RegExp(`\\b${planet}\\b`, 'g');
      htmlDescription = htmlDescription.replace(
        regex,
        `<span class="planet-${planet}">${planet}</span>`,
      );
    });

    // Add sign classes
    Object.keys(COLORS.SIGN_COLORS).forEach((sign) => {
      const regex = new RegExp(`\\b${sign}\\b`, 'g');
      htmlDescription = htmlDescription.replace(regex, `<span class="sign-${sign}">${sign}</span>`);
    });

    // Add aspect classes
    Object.keys(COLORS.ASPECT_COLORS).forEach((aspect) => {
      const regex = new RegExp(`\\b${aspect}\\b`, 'g');
      htmlDescription = htmlDescription.replace(
        regex,
        `<span class="aspect-${aspect}">${aspect}</span>`,
      );
    });

    htmlContent += `
    <li class="event-item">
      <span class="date">${dateStr}</span>
      ${htmlType}
      <span class="description">${htmlDescription}</span>
    </li>`;
  }

  // Close HTML
  htmlContent += `
  </ul>
</body>
</html>`;

  // Write the HTML file
  const outputPath = 'astrological-events.html';
  fs.writeFileSync(outputPath, htmlContent);
  console.log(`HTML output generated: ${outputPath}`);
};
