import { PLANETS, SIGNS } from '../constants';
import {
  EventDetector,
  type PlanetaryData,
  type AstrologicalEvent,
  type PlanetName,
  type SignName,
} from '../types';
import { isInSign } from '../utils';

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
      const prevPos = previousData[planet].longitude;

      for (const sign of this.signs) {
        const prevInSign = isInSign(prevPos, sign);
        const currInSign = isInSign(currPos, sign);

        if (!prevInSign && currInSign) {
          events.push({
            date: new Date(currentDate),
            type: 'ingress',
            description: `${planet} enters ${sign}`,
          });
        } else if (prevInSign && !currInSign) {
          events.push({
            date: new Date(currentDate),
            type: 'egress',
            description: `${planet} leaves ${sign}`,
          });
        }
      }
    }

    return events;
  }
}
