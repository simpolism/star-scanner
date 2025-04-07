import * as sweph from 'sweph';
import * as path from 'path';
import { EventEmitter } from 'events';
import { EventDetector, type PlanetaryData, type AstrologicalEvent } from './types';
import { getPlanetData, julianDayFromDate, colorizeText, colorizeEventType } from './utils';
import { COLORS, END_DATE, PLANETS, START_DATE } from './constants';
import {
  PlanetarySignConfiguration,
  AspectDetector,
  RetrogradeDetector,
  SignIngressDetector,
} from './eventDetectors/index';

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

  displayEvents(events: AstrologicalEvent[]): void {
    if (!events.length) {
      console.log('No events found.');
      return;
    }

    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log(`Found ${events.length} events:`);
    console.log('-'.repeat(70));

    for (const event of events) {
      const dateStr = event.date.toISOString().split('T')[0];
      // Apply colors to event type and description
      const coloredType = colorizeEventType(event.type as keyof typeof COLORS.TYPE_COLORS);
      const coloredDescription = colorizeText(event.description);

      console.log(
        `${dateStr} | ${coloredType.padEnd(15 + COLORS.RESET.length)} | ${coloredDescription}`,
      );
    }
  }
}

// Setup and execute
async function main(): Promise<void> {
  // Create event detectors
  const detectors: EventDetector[] = [
    // All outer planet ingresses
    new SignIngressDetector(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),

    // Any planet ingress into Aquarius
    // new SignIngressDetector(['Sun', 'Mercury', 'Venus', 'Mars'], ['Aquarius']),

    // Retrograde motion
    new RetrogradeDetector(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']),

    // Major aspects between outer planets
    new AspectDetector(
      [
        // ['Sun', 'Saturn'],
        // ['Sun', 'Uranus'],
        // ['Sun', 'Neptune'],
        // ['Sun', 'Pluto'],
        // ['Mercury', 'Saturn'],
        // ['Mercury', 'Uranus'],
        // ['Mercury', 'Neptune'],
        // ['Mercury', 'Pluto'],
        // ['Venus', 'Saturn'],
        // ['Venus', 'Uranus'],
        // ['Venus', 'Neptune'],
        // ['Venus', 'Pluto'],
        // ['Mars', 'Saturn'],
        // ['Mars', 'Uranus'],
        // ['Mars', 'Neptune'],
        // ['Mars', 'Pluto'],
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

    // Example of a specific configuration detector
    new PlanetarySignConfiguration('Multiple planets in Aquarius', [
      ['Jupiter', 'Aquarius'],
      ['Saturn', 'Aquarius'],
    ]),
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
  scanner.displayEvents(events);
  return;
}

// Run the program
main().catch((error) => {
  console.error('An error occurred:', error);
});
