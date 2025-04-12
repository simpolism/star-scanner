// src/scanner.ts
import { EventEmitter } from 'events';
import { EventDetector, type PlanetaryData, type AstrologicalEvent } from './types';
import { getPlanetData, julianDayFromDate } from './utils';
import { PLANETS } from './constants';

export class AstrologicalEventScanner extends EventEmitter {
  private startDate: Date;
  private endDate: Date;
  private eventDetectors: EventDetector[];
  private isRunning = false;

  constructor(startDate: Date, endDate: Date, eventDetectors: EventDetector[]) {
    super();
    const MAX_COMPUTE_ITEMS = 5000; // should ALWAYS be WELL under <10s
    const N_COMPUTE_POINTS = Object.keys(PLANETS).length;
    const MAX_DAYS = MAX_COMPUTE_ITEMS / N_COMPUTE_POINTS;
    const DAYS_REQUESTED = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    if (DAYS_REQUESTED > MAX_DAYS) {
      throw new Error(
        `Request too large! ${
          DAYS_REQUESTED * N_COMPUTE_POINTS
        } events requested, vs ${MAX_COMPUTE_ITEMS} max. Try reducing number of computed points or date range.`,
      );
    }
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.eventDetectors = eventDetectors;
  }

  async scan(): Promise<AstrologicalEvent[]> {
    const allEvents: AstrologicalEvent[] = [];
    const currentDate = new Date(this.startDate);
    let previousData: PlanetaryData | null = null;
    let previousData2: PlanetaryData | null = null;
    let previousDate: Date | null = null;

    this.isRunning = true;
    this.emit('start', { startDate: this.startDate, endDate: this.endDate });

    while (currentDate <= this.endDate && this.isRunning) {
      const jd = julianDayFromDate(currentDate);

      // Get current positions and data for all planets
      const currentData: PlanetaryData = {};
      for (const [planetName, planetId] of Object.entries(PLANETS)) {
        currentData[planetName] = getPlanetData(jd, planetId);
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
      previousDate = new Date(currentDate);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);

      // Emit progress update (every 30 days)
      if (currentDate.getDate() === 1) {
        this.emit('progress', {
          currentDate: new Date(currentDate),
          eventsFound: allEvents.length,
          percentComplete: Math.round(
            ((currentDate.getTime() - this.startDate.getTime()) /
              (this.endDate.getTime() - this.startDate.getTime())) *
              100,
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
