import { PLANETS, SIGNS } from '../constants';
import {
  type AstrologicalEvent,
  EventDetector,
  type PlanetaryData,
  type PlanetName,
  type SignName,
} from '../types';
import { detectSign, isInSign, JulianDate } from '../utils';

export interface RetrogradeData {
  planet: PlanetName;
  direction: 'retrograde' | 'direct';
  sign: SignName;
}

export class RetrogradeDetector extends EventDetector<RetrogradeData> {
  private planets: PlanetName[];
  private signs: SignName[];
  private checkSign: boolean;

  constructor(planets?: PlanetName[], signs?: SignName[]) {
    super();
    this.planets = planets || (Object.keys(PLANETS) as PlanetName[]);
    this.signs = signs || (Object.keys(SIGNS) as SignName[]);
    this.checkSign = !!signs;
  }

  detect(
    currentDate: JulianDate,
    currentData: PlanetaryData,
    previousDate: JulianDate,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent<RetrogradeData>[] {
    const events: AstrologicalEvent<RetrogradeData>[] = [];

    // Skip if no previous data
    if (!previousData) {
      return events;
    }

    for (const planet of this.planets) {
      if (!(planet in currentData) || !(planet in previousData)) {
        continue;
      }

      const currRetro = currentData[planet].retrograde;
      const prevRetro = previousData[planet].retrograde;

      // Skip if no change in retrograde status
      if (currRetro === prevRetro) {
        continue;
      }

      const currPos = currentData[planet].longitude;

      // If checking specific signs, verify planet is in one of them
      if (this.checkSign) {
        let inTargetSign = false;
        for (const sign of this.signs) {
          if (isInSign(currPos, sign)) {
            inTargetSign = true;
            const status = currRetro ? 'begins retrograde' : 'goes direct';
            events.push({
              date: currentDate,
              type: 'retrograde',
              description: `${planet} ${status} in ${sign}`,
            });
            break;
          }
        }

        // Skip if not in any target sign
        if (!inTargetSign) {
          continue;
        }
      } else {
        // Not checking signs, just report the retrograde change
        const status = currRetro ? 'begins retrograde' : 'goes direct';
        events.push({
          date: currentDate,
          type: 'retrograde',
          description: `${planet} ${status}`,
          data: {
            planet: planet,
            direction: currRetro ? 'retrograde' : 'direct',
            sign: detectSign(currPos),
          },
        });
      }
    }

    return events;
  }
}
