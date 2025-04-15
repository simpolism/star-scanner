// src/scanner.ts
import { EventEmitter } from 'events';
import { EventDetector, type PlanetaryData, type AstrologicalEvent } from './types';
import { getPlanetData, JulianDate } from './utils';
import { PLANETS } from './constants';

export class AstrologicalEventScanner extends EventEmitter {
  private isRunning = false;

  constructor(
    private startDate: JulianDate,
    private endDate: JulianDate,
    private eventDetectors: EventDetector[],
  ) {
    super();
  }

  async scan(): Promise<AstrologicalEvent[]> {
    const allEvents: AstrologicalEvent[] = [];
    let currentDate = this.startDate;
    let previousData: PlanetaryData | null = null;
    let previousData2: PlanetaryData | null = null;
    let previousDate: JulianDate | null = null;

    this.isRunning = true;
    this.emit('start', { startDate: this.startDate, endDate: this.endDate });

    while (currentDate <= this.endDate && this.isRunning) {
      // Get current positions and data for all planets
      const currentData: PlanetaryData = {};
      for (const [planetName, planetId] of Object.entries(PLANETS)) {
        currentData[planetName] = getPlanetData(currentDate, planetId);
      }

      // Run all event detectors
      for (const detector of this.eventDetectors) {
        const events = detector.detect(
          currentDate,
          currentData,
          previousDate,
          previousData,
          previousData2,
        );
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
      previousData2 = previousData;
      previousData = currentData;
      previousDate = currentDate;

      // Move to next day -- in the future this interval will be provided
      currentDate += 1;

      // Emit progress update (every 30 days)
      if (Math.floor(currentDate) % 30 === 1) {
        this.emit('progress', {
          currentDate,
          eventsFound: allEvents.length,
          percentComplete: Math.round(
            ((currentDate - this.startDate) / (this.endDate - this.startDate)) * 100,
          ),
        });
      }

      // Allow other operations to proceed by yielding the event loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    this.emit('complete', { eventsFound: allEvents.length });
    this.isRunning = false;
    return allEvents;
  }

  stop(): void {
    this.isRunning = false;
    this.emit('stopped', { reason: 'User requested stop' });
  }
}
