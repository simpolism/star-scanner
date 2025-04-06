import {
  EventDetector,
  type PlanetaryData,
  type AstrologicalEvent,
  type PlanetName,
  type SignName,
} from '../types';
import { isInSign } from '../utils';

export class PlanetarySignConfiguration extends EventDetector {
  private configurationName: string;
  private planetSignPairs: [PlanetName, SignName][];

  constructor(configurationName: string, planetSignPairs: [PlanetName, SignName][]) {
    super();
    this.configurationName = configurationName;
    this.planetSignPairs = planetSignPairs;
  }

  detect(
    currentDate: Date,
    currentData: PlanetaryData,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent[] {
    const events: AstrologicalEvent[] = [];

    // Check if all planets are in their specified signs
    let allCriteriaMet = true;
    for (const [planet, sign] of this.planetSignPairs) {
      if (!(planet in currentData)) {
        allCriteriaMet = false;
        break;
      }

      if (!isInSign(currentData[planet].longitude, sign)) {
        allCriteriaMet = false;
        break;
      }
    }

    // Check if configuration was not met previously (to avoid duplicates)
    let wasMetPreviously = false;
    if (previousData && allCriteriaMet) {
      wasMetPreviously = true;
      for (const [planet, sign] of this.planetSignPairs) {
        if (!(planet in previousData)) {
          wasMetPreviously = false;
          break;
        }

        if (!isInSign(previousData[planet].longitude, sign)) {
          wasMetPreviously = false;
          break;
        }
      }
    }

    // If criteria met now but not previously, record the event
    if (allCriteriaMet && !wasMetPreviously) {
      const planetDescriptions = this.planetSignPairs.map(
        ([planet, sign]) => `${planet} in ${sign}`,
      );
      const description = `${this.configurationName}: ${planetDescriptions.join(', ')}`;

      events.push({
        date: new Date(currentDate),
        type: 'configuration',
        description,
      });
    }

    return events;
  }
}
