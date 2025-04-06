import { PLANETS, SIGNS } from '../constants';
import {
  EventDetector,
  type PlanetaryData,
  type AstrologicalEvent,
  type PlanetName,
  type SignName,
} from '../types';
import { detectSign } from '../utils';

export class SignIngressDetector extends EventDetector {
  private planets: PlanetName[];
  private signs: SignName[];

  constructor(planets?: PlanetName[], signs?: SignName[]) {
    super();
    this.planets = planets || Object.keys(PLANETS);
    this.signs = signs || Object.keys(SIGNS);
  }

  detect(
    currentDate: Date,
    currentData: PlanetaryData,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent[] {
    const events: AstrologicalEvent[] = [];

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
        });
      }
    }

    return events;
  }
}
