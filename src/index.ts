import * as sweph from 'sweph';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { EventDetector, type PlanetaryData, type AstrologicalEvent, EventProcessor } from './types';
import { getPlanetData, julianDayFromDate } from './utils';
import { END_DATE, PLANETS, START_DATE } from './constants';
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
        // augment list of events with full astro data for image construction
        const eventsWithAstroData: AstrologicalEvent[] = events.map((e) => ({
          ...e,
          planets: currentData,
        }));
        allEvents.push(...eventsWithAstroData);

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

  // New method to save events to JSON file
  saveEventsToJson(events: AstrologicalEvent[], eventProcessors: Array<EventProcessor> = []): void {
    // Apply event processors to get any special events
    const processedEvents = events.map((event) => {
      const processedOutputs = eventProcessors
        .map((processor) => processor(event))
        .filter((output) => output !== null);

      return {
        ...event,
        date: event.date.toISOString(), // Convert Date to string for JSON
        processedOutputs,
      };
    });

    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, '..', 'public');
    const dataDir = path.join(publicDir, 'data');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Write JSON file
    const outputPath = path.join(dataDir, 'astrological-events.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          metadata: {
            startDate: START_DATE.toISOString(),
            endDate: END_DATE.toISOString(),
            generatedAt: new Date().toISOString(),
            totalEvents: events.length,
          },
          events: processedEvents,
        },
        null,
        2,
      ),
    );

    console.log(`JSON data saved to: ${outputPath}`);
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

  // Save to JSON
  scanner.saveEventsToJson(events, [PlutoRetrogradeProcessor, NeptunePlutoIngressProcessor]);

  console.log('Event data generated and saved. You can now view the data in the static HTML site.');
  return;
}

// Run the program
main().catch((error) => {
  console.error('An error occurred:', error);
});
