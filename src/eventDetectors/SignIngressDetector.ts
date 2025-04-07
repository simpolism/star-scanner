import { PLANETS } from '../constants';
import {
  EventDetector,
  type PlanetaryData,
  type AstrologicalEvent,
  type PlanetName,
  type SignName,
} from '../types';
import { detectSign } from '../utils';

export interface IngressData {
  planet: PlanetName;
  prevSign: SignName;
  newSign: SignName;
}

export class SignIngressDetector extends EventDetector<IngressData> {
  private planets: PlanetName[];

  constructor(planets?: PlanetName[]) {
    super();
    this.planets = planets || (Object.keys(PLANETS) as PlanetName[]);
  }

  detect(
    currentDate: Date,
    currentData: PlanetaryData,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent<IngressData>[] {
    const events: AstrologicalEvent<IngressData>[] = [];

    // Skip if no previous data
    if (!previousData) {
      return events;
    }

    for (const planet of this.planets) {
      if (!(planet in currentData) || !(planet in previousData)) {
        continue;
      }

      const currPos = currentData[planet].longitude;
      const currSign = detectSign(currPos);
      const prevPos = previousData[planet].longitude;
      const prevSign = detectSign(prevPos);
      if (currSign !== prevSign) {
        events.push({
          date: new Date(currentDate),
          type: 'ingress',
          description: `${planet} enters ${currSign} (from ${prevSign})`,
          data: {
            planet,
            prevSign,
            newSign: currSign,
          },
        });
      }
    }

    return events;
  }
}
