import { PLANETS } from '../constants';
import {
  EventDetector,
  type PlanetaryData,
  type AstrologicalEvent,
  type PlanetName,
  type SignName,
  type JulianDate,
  type BaseDetectorConfig,
} from '../types';
import { detectSign } from '../utils';
import { z } from 'zod';

export interface IngressData {
  planet: PlanetName;
  prevSign: SignName;
  newSign: SignName;
}

export interface SignIngressDetectorConfig extends BaseDetectorConfig {
  planets: PlanetName[];
}

export class SignIngressDetector extends EventDetector<
  IngressData,
  SignIngressDetectorConfig
> {
  static configSchema = z.object({
    enabled: z.boolean(),
    planets: z.array(
      z.enum([...PLANETS.keys()] as [PlanetName, ...PlanetName[]]),
    ),
  });

  constructor(config: SignIngressDetectorConfig) {
    super(config);
  }

  detect(
    currentDate: JulianDate,
    currentData: PlanetaryData,
    previousDate: JulianDate | null,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent<IngressData>[] {
    const events: AstrologicalEvent<IngressData>[] = [];

    // Skip if not enabled or no previous data
    if (!this.config.enabled || !previousData) {
      return events;
    }

    for (const planet of this.config.planets) {
      if (!(planet in currentData) || !(planet in previousData)) {
        continue;
      }

      const currPos = currentData[planet].longitude;
      const currSign = detectSign(currPos);
      const prevPos = previousData[planet].longitude;
      const prevSign = detectSign(prevPos);
      if (currSign !== prevSign) {
        events.push({
          date: currentDate,
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
