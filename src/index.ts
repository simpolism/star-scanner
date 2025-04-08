import * as sweph from 'sweph';
import * as path from 'path';
import { EventEmitter } from 'events';
import { EventDetector, type PlanetaryData, type AstrologicalEvent, EventProcessor } from './types';
import { getPlanetData, julianDayFromDate, colorizeText, colorizeEventType } from './utils';
import { COLORS, END_DATE, PLANETS, START_DATE } from './constants';
import { AspectDetector, RetrogradeDetector, SignIngressDetector } from './eventDetectors';
import { NeptunePlutoIngressProcessor, PlutoRetrogradeProcessor } from './eventProcessors';

// Initialize Swiss Ephemeris
const ephePath = path.join(__dirname, 'ephemeris');
sweph.set_ephe_path(ephePath);

interface StartEventType {
  startDate: Date;
  endDate: Date;
}
interface ProgressEventType {
  currentDate: Date;
  eventsFound: number;
  percentComplete: number;
}

interface CompleteEventType {
  eventsFound: number;
}

class AstrologicalEventScanner extends EventEmitter {
  private startDate: Date;
  private endDate: Date;
  private eventDetectors: EventDetector[];
  private isRunning = false;

  constructor(startDate: Date, endDate: Date, eventDetectors: EventDetector[]) {
    super();
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.eventDetectors = eventDetectors;
  }

  async scan(): Promise<AstrologicalEvent[]> {
    const allEvents: AstrologicalEvent[] = [];
    const currentDate = new Date(this.startDate);
    let previousData: PlanetaryData | null = null;

    this.isRunning = true;
    const startEvent: StartEventType = { startDate: this.startDate, endDate: this.endDate };
    this.emit('start', startEvent);

    console.log(
      `Scanning for astrological events from ${this.startDate.toDateString()} to ${this.endDate.toDateString()}...`,
    );

    while (currentDate <= this.endDate && this.isRunning) {
      const jd = julianDayFromDate(currentDate);

      // Get current positions and data for all planets
      const currentData: PlanetaryData = {};
      for (const [planetName, planetId] of Object.entries(PLANETS)) {
        currentData[planetName] = getPlanetData(jd, planetId);
      }

      // Run all event detectors
      for (const detector of this.eventDetectors) {
        const events = detector.detect(currentDate, currentData, previousData);
        allEvents.push(...events);

        // Emit events as they're found
        for (const event of events) {
          this.emit('event', event);
        }
      }

      // Store current data for next iteration
      previousData = currentData;

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);

      // Emit progress update (every 30 days)
      if (currentDate.getDate() === 1) {
        const progressEvent: ProgressEventType = {
          currentDate: new Date(currentDate),
          eventsFound: allEvents.length,
          percentComplete: Math.round(
            ((currentDate.getTime() - this.startDate.getTime()) /
              (this.endDate.getTime() - this.startDate.getTime())) *
              100,
          ),
        };
        this.emit('progress', progressEvent);
      }

      // Allow other operations to proceed by yielding the event loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const completeEvent: CompleteEventType = { eventsFound: allEvents.length };
    this.emit('complete', completeEvent);
    this.isRunning = false;
    return allEvents;
  }

  stop(): void {
    this.isRunning = false;
    this.emit('stopped', { reason: 'User requested stop' });
  }

  displayEvents(events: AstrologicalEvent[], eventProcessors: Array<EventProcessor> = []): void {
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

    // First, process all events to collect special events by date
    const specialEvents: Record<string, string[]> = {};
    for (const event of events) {
      // Run event processors to identify special events
      const originalLog = console.log;
      console.log = (message: string) => {
        if (message.startsWith('------------')) {
          const dateKey = event.date.toISOString().split('T')[0];
          if (!specialEvents[dateKey]) {
            specialEvents[dateKey] = [];
          }
          specialEvents[dateKey].push(message.replace(/[-]/g, ''));
        } else {
          originalLog(message);
        }
      };
      
      for (const processor of eventProcessors) {
        processor(event);
      }
      // Restore console.log
      console.log = originalLog;
    }

    // Then render all events in chronological order, including special events
    const processedDates = new Set<string>();
    
    for (const event of events) {
      const dateStr = event.date.toISOString().split('T')[0];
      
      // If we haven't processed this date yet and there are special events for this date,
      // add them first as they serve as section dividers
      if (!processedDates.has(dateStr) && specialEvents[dateStr]) {
        processedDates.add(dateStr);
        
        for (const specialEvent of specialEvents[dateStr]) {
          htmlContent += `
    <li class="major-event-item">
      <span class="date">${dateStr}</span>
      <span class="special-event">${specialEvent}</span>
    </li>`;
        }
      }
      
      // Add the regular event
      const htmlType = `<span class="type type-${event.type}">${event.type.toUpperCase()}</span>`;
      
      // Replace ANSI colors with HTML spans
      let htmlDescription = event.description;
      
      // Add planet classes
      Object.keys(COLORS.PLANET_COLORS).forEach(planet => {
        const regex = new RegExp(`\\b${planet}\\b`, 'g');
        htmlDescription = htmlDescription.replace(regex, `<span class="planet-${planet}">${planet}</span>`);
      });
      
      // Add sign classes
      Object.keys(COLORS.SIGN_COLORS).forEach(sign => {
        const regex = new RegExp(`\\b${sign}\\b`, 'g');
        htmlDescription = htmlDescription.replace(regex, `<span class="sign-${sign}">${sign}</span>`);
      });
      
      // Add aspect classes
      Object.keys(COLORS.ASPECT_COLORS).forEach(aspect => {
        const regex = new RegExp(`\\b${aspect}\\b`, 'g');
        htmlDescription = htmlDescription.replace(regex, `<span class="aspect-${aspect}">${aspect}</span>`);
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
    const fs = require('fs');
    const outputPath = 'astrological-events.html';
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`HTML output generated: ${outputPath}`);
  }
}

// Setup and execute
async function main(): Promise<void> {
  // Create event detectors
  const detectors: EventDetector[] = [
    // All outer planet ingresses
    new SignIngressDetector(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),

    // Retrograde motion
    new RetrogradeDetector(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),

    // Major aspects between outer planets
    new AspectDetector(
      [
        ['Jupiter', 'Saturn'],
        ['Jupiter', 'Uranus'],
        ['Jupiter', 'Neptune'],
        ['Jupiter', 'Pluto'],
        ['Saturn', 'Uranus'],
        ['Saturn', 'Neptune'],
        ['Saturn', 'Pluto'],
        ['Uranus', 'Neptune'],
        ['Uranus', 'Pluto'],
        ['Neptune', 'Pluto'],
      ],
      ['conjunction', 'opposition', 'square', 'trine'],
    ),
  ];

  // Create scanner
  const scanner = new AstrologicalEventScanner(START_DATE, END_DATE, detectors);

  // Set up event listeners
  scanner.on('start', (info: StartEventType) => {
    console.log(`Scan started: ${info.startDate.toDateString()} to ${info.endDate.toDateString()}`);
  });

  scanner.on('progress', (progress: ProgressEventType) => {
    console.log(
      `Progress: ${progress.percentComplete}% complete (${progress.currentDate.toDateString()})`,
    );
  });

  scanner.on('complete', (result: CompleteEventType) => {
    console.log(`Scan complete. Found ${result.eventsFound} events.`);
  });

  // Run the scan
  const events = await scanner.scan();

  // Add relevant processors
  scanner.displayEvents(events, [PlutoRetrogradeProcessor, NeptunePlutoIngressProcessor]);
  return;
}

// Run the program
main().catch((error) => {
  console.error('An error occurred:', error);
});
