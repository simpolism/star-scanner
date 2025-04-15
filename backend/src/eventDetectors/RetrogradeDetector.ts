import { PLANETS, SIGNS } from '../constants';
import {
  type AstrologicalEvent,
  EventDetector,
  type PlanetaryData,
  type PlanetName,
  type SignName,
  type JulianDate,
  type BaseDetectorConfig,
} from '../types';
import { detectSign, isInSign } from '../utils';
import { z } from 'zod';

export interface RetrogradeData {
  planet: PlanetName;
  direction: 'retrograde' | 'direct';
  sign: SignName;
}

export interface RetrogradeDetectorConfig extends BaseDetectorConfig {
  planets: PlanetName[];
  signs: SignName[];
  checkSign: boolean;
}

export class RetrogradeDetector extends EventDetector<
  RetrogradeData,
  RetrogradeDetectorConfig
> {
  static configSchema = z.object({
    enabled: z.boolean(),
    planets: z.array(
      z.enum([...PLANETS.keys()] as [PlanetName, ...PlanetName[]]),
    ),
    signs: z.array(z.enum([...SIGNS.keys()] as [SignName, ...SignName[]])),
    checkSign: z.boolean(),
  });

  constructor(config: RetrogradeDetectorConfig) {
    super(config);
  }

  detect(
    currentDate: JulianDate,
    currentData: PlanetaryData,
    previousDate: JulianDate,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent<RetrogradeData>[] {
    const events: AstrologicalEvent<RetrogradeData>[] = [];

    // Skip if not enabled or no previous data
    if (!this.config.enabled || !previousData) {
      return events;
    }

    for (const planet of this.config.planets) {
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
      if (this.config.checkSign) {
        let inTargetSign = false;
        for (const sign of this.config.signs) {
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
