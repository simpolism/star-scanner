import * as sweph from 'sweph';
import * as path from 'path';
import * as fs from 'fs';
import { EventDetector, type AstrologicalEvent, EventProcessor } from './types';
import { END_DATE, START_DATE } from './constants';
import { AstrologicalEventScanner } from './scanner';
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

// New method to save events to JSON file
function saveEventsToJson(
  events: AstrologicalEvent[],
  eventProcessors: Array<EventProcessor> = [],
): void {
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
  saveEventsToJson(events, [PlutoRetrogradeProcessor, NeptunePlutoIngressProcessor]);

  console.log('Event data generated and saved. You can now view the data in the static HTML site.');
  return;
}

// Run the program
main().catch((error) => {
  console.error('An error occurred:', error);
});
