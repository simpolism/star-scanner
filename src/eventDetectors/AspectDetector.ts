import { ASPECTS, PLANETS } from '../constants';
import {
  EventDetector,
  type PlanetaryData,
  type AstrologicalEvent,
  type PlanetName,
  type AspectName,
} from '../types';
import { checkAspect } from '../utils';

export class AspectDetector extends EventDetector {
  private planetPairs: [PlanetName, PlanetName][];
  private aspects: AspectName[];

  constructor(planetPairs?: [PlanetName, PlanetName][], aspects?: AspectName[]) {
    super();
    // If no planet pairs specified, check all combinations
    if (!planetPairs) {
      const planetList = Object.keys(PLANETS);
      this.planetPairs = [];
      for (let i = 0; i < planetList.length; i++) {
        for (let j = i + 1; j < planetList.length; j++) {
          this.planetPairs.push([planetList[i], planetList[j]]);
        }
      }
    } else {
      this.planetPairs = planetPairs;
    }

    this.aspects = aspects || Object.keys(ASPECTS);
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

    for (const [p1, p2] of this.planetPairs) {
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

      for (const aspect of this.aspects) {
        const hasAspectNow = checkAspect(currPos1, currPos2, aspect);
        const hadAspectPrev = checkAspect(prevPos1, prevPos2, aspect);

        // Detect aspect becoming exact (crossing from not in orb to in orb)
        if (hasAspectNow && !hadAspectPrev) {
          events.push({
            date: new Date(currentDate),
            type: 'aspect',
            description: `${p1} ${aspect} ${p2}`,
          });
        }
      }
    }

    return events;
  }
}
