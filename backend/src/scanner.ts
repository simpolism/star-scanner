// src/scanner.ts
import { EventDetector, type PlanetaryData, type AstrologicalEvent } from './types';
import { getPlanetData, JulianDate } from './utils';
import { PLANETS } from './constants';

export class AstrologicalEventScanner {
  constructor(
    private startDate: JulianDate,
    private endDate: JulianDate,
    private eventDetectors: EventDetector[],
  ) {
    // empty
  }

  async scan(): Promise<AstrologicalEvent[]> {
    const allEvents: AstrologicalEvent[] = [];
    let currentDate = this.startDate;
    let previousData: PlanetaryData | null = null;
    let previousData2: PlanetaryData | null = null;
    let previousDate: JulianDate | null = null;

    while (currentDate <= this.endDate) {
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
      }

      // Store current data for next iteration
      previousData2 = previousData;
      previousData = currentData;
      previousDate = currentDate;

      // Move to next day -- in the future this interval will be provided
      currentDate += 1;

      // Allow other operations to proceed by yielding the event loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return allEvents;
  }
}
