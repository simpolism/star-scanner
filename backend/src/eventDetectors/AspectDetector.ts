import { ASPECTS, PLANETS } from '../constants';
import {
  EventDetector,
  type PlanetaryData,
  type AstrologicalEvent,
  type PlanetName,
  type AspectName,
  type SignName,
  type JulianDate,
  type BaseDetectorConfig,
  Degree,
} from '../types';
import { checkAspect, detectSign } from '../utils';
import { z } from 'zod';

// TODO: orb and position data, clean up tuples
export interface AspectData {
  planet1: [PlanetName, SignName];
  planet2: [PlanetName, SignName];
  aspect: AspectName;
  aspectSize?: number;
  status: 'start' | 'end' | 'peak';
}

export interface AspectDetectorConfig extends BaseDetectorConfig {
  planetPairs: [PlanetName, PlanetName][];
  aspects: [AspectName, Degree][];
}

export class AspectDetector extends EventDetector<
  AspectData,
  AspectDetectorConfig
> {
  static configSchema = z.object({
    enabled: z.boolean(),
    planetPairs: z.array(
      z.tuple([
        z.enum([...PLANETS.keys()] as [PlanetName, ...PlanetName[]]),
        z.enum([...PLANETS.keys()] as [PlanetName, ...PlanetName[]]),
      ]),
    ),
    aspects: z.array(
      z.tuple([
        z.enum([...ASPECTS.keys()] as [AspectName, ...AspectName[]]),
        z.number(),
      ]),
    ),
  });

  constructor(config: AspectDetectorConfig) {
    super(config);
  }

  detect(
    currentDate: JulianDate,
    currentData: PlanetaryData,
    previousDate: JulianDate | null,
    previousData: PlanetaryData | null,
    previousData2: PlanetaryData | null,
  ): AstrologicalEvent<AspectData>[] {
    const events: AstrologicalEvent<AspectData>[] = [];

    // Skip if not enabled or no previous data
    if (!this.config.enabled || !previousData || !previousData2) {
      return events;
    }

    for (const [p1, p2] of this.config.planetPairs) {
      if (!(p1 in currentData) || !(p2 in currentData)) {
        continue;
      }
      if (!(p1 in previousData) || !(p2 in previousData)) {
        continue;
      }

      const currPos1 = currentData[p1].longitude;
      const currPos2 = currentData[p2].longitude;
      const prevPos1 = previousData[p1].longitude;
      const prevPos2 = previousData[p2].longitude;
      const prev2Pos1 = previousData2[p1].longitude;
      const prev2Pos2 = previousData2[p2].longitude;

      for (const [aspect, orb] of this.config.aspects) {
        const hasAspectNow = checkAspect(currPos1, currPos2, aspect, orb);
        const hadAspectPrev = checkAspect(prevPos1, prevPos2, aspect, orb);
        const hadAspectPrev2 = checkAspect(prev2Pos1, prev2Pos2, aspect, orb);

        // Detect aspect becoming exact (crossing from not in orb to in orb)
        if (hasAspectNow && !hadAspectPrev) {
          events.push({
            date: currentDate,
            type: 'aspect_begin',
            description: `${p1} ${aspect} ${p2} (orb: ${hasAspectNow.toFixed(
              2,
            )} deg)`,
            data: {
              planet1: [p1, detectSign(currPos1)],
              planet2: [p2, detectSign(currPos2)],
              aspect,
              aspectSize: hasAspectNow,
              status: 'start',
            },
          });
        } else if (hadAspectPrev && !hasAspectNow) {
          events.push({
            date: currentDate,
            type: 'aspect_end',
            description: `${p1} ${aspect} ${p2} (orb: ${hadAspectPrev.toFixed(
              2,
            )} deg)`,
            data: {
              planet1: [p1, detectSign(prevPos1)],
              planet2: [p2, detectSign(prevPos2)],
              aspect,
              aspectSize: hadAspectPrev,
              status: 'end',
            },
          });
        } else if (
          previousDate &&
          hadAspectPrev2 &&
          hadAspectPrev &&
          hasAspectNow &&
          hadAspectPrev2 > hadAspectPrev &&
          hadAspectPrev < hasAspectNow
        ) {
          events.push({
            date: previousDate,
            type: 'aspect_peak',
            description: `${p1} ${aspect} ${p2} (orb: ${hadAspectPrev.toFixed(
              2,
            )} deg)`,
            data: {
              planet1: [p1, detectSign(prevPos1)],
              planet2: [p2, detectSign(prevPos2)],
              aspect,
              aspectSize: hadAspectPrev,
              status: 'peak',
            },
          });
        }
      }
    }

    return events;
  }
}
