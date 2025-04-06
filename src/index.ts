import * as sweph from 'sweph';
import * as path from 'path';
import { EventEmitter } from 'events';

// Types
type PlanetData = {
  longitude: number;
  latitude: number;
  distance: number;
  speedLong: number;
  speedLat: number;
  speedDist: number;
  retrograde: boolean;
};

type PlanetaryData = {
  [planet: string]: PlanetData;
};

type AstrologicalEvent = {
  date: Date;
  type: string;
  description: string;
};

// Configuration
const START_DATE = new Date(2025, 3, 5); // April 5, 2025
const END_DATE = new Date(2030, 11, 31); // December 31, 2030
const PLANETS: { [name: string]: number } = {
  'Jupiter': sweph.SE_JUPITER,
  'Saturn': sweph.SE_SATURN,
  'Uranus': sweph.SE_URANUS,
  'Neptune': sweph.SE_NEPTUNE,
  'Pluto': sweph.SE_PLUTO
};
const SIGNS: { [name: string]: [number, number] } = {
  'Aries': [0, 30],
  'Taurus': [30, 60],
  'Gemini': [60, 90],
  'Cancer': [90, 120],
  'Leo': [120, 150],
  'Virgo': [150, 180],
  'Libra': [180, 210],
  'Scorpio': [210, 240],
  'Sagittarius': [240, 270],
  'Capricorn': [270, 300],
  'Aquarius': [300, 330],
  'Pisces': [330, 360]
};
const ASPECTS: { [name: string]: { angle: number, orb: number } } = {
  'conjunction': { angle: 0.0, orb: 8.0 },
  'opposition': { angle: 180.0, orb: 8.0 },
  'trine': { angle: 120.0, orb: 6.0 },
  'square': { angle: 90.0, orb: 6.0 },
  'sextile': { angle: 60.0, orb: 4.0 }
};

// Initialize Swiss Ephemeris
// Update this path to where your ephemeris files are stored
const ephePath = path.join(__dirname, 'ephemeris');
sweph.setEphePath(ephePath);

// Core utility functions
function julianDayFromDate(date: Date): number {
  return sweph.julDay(
    date.getFullYear(),
    date.getMonth() + 1, // JavaScript months are 0-based
    date.getDate(),
    0
  );
}

function getPlanetData(jd: number, planetId: number): PlanetData {
  const result = sweph.calc(jd, planetId, sweph.SEFLG_SPEED);
  return {
    longitude: result.longitude,
    latitude: result.latitude,
    distance: result.distance,
    speedLong: result.speedLong,
    speedLat: result.speedLat,
    speedDist: result.speedDist,
    retrograde: result.speedLong < 0
  };
}

function isInSign(position: number, signName: string): boolean {
  const [start, end] = SIGNS[signName];
  const normalizedPos = position % 360;
  return start <= normalizedPos && normalizedPos < end;
}

function checkAspect(pos1: number, pos2: number, aspectName: string): boolean {
  const { angle, orb } = ASPECTS[aspectName];
  
  // Calculate the smallest angle between positions
  let diff = Math.abs(pos1 - pos2) % 360;
  if (diff > 180) {
    diff = 360 - diff;
  }
  
  // Check if within orb
  return Math.abs(diff - angle) <= orb;
}

// Event detector interface and implementations
abstract class EventDetector {
  abstract detect(currentDate: Date, currentData: PlanetaryData, previousData: PlanetaryData | null): AstrologicalEvent[];
}

class SignIngressDetector extends EventDetector {
  private planets: string[];
  private signs: string[];

  constructor(planets?: string[], signs?: string[]) {
    super();
    this.planets = planets || Object.keys(PLANETS);
    this.signs = signs || Object.keys(SIGNS);
  }

  detect(currentDate: Date, currentData: PlanetaryData, previousData: PlanetaryData | null): AstrologicalEvent[] {
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
            description: `${planet} enters ${sign}`
          });
        } else if (prevInSign && !currInSign) {
          events.push({
            date: new Date(currentDate),
            type: 'egress',
            description: `${planet} leaves ${sign}`
          });
        }
      }
    }
    
    return events;
  }
}

class RetrogradeDetector extends EventDetector {
  private planets: string[];
  private signs: string[];
  private checkSign: boolean;

  constructor(planets?: string[], signs?: string[]) {
    super();
    this.planets = planets || Object.keys(PLANETS);
    this.signs = signs || Object.keys(SIGNS);
    this.checkSign = !!signs;
  }

  detect(currentDate: Date, currentData: PlanetaryData, previousData: PlanetaryData | null): AstrologicalEvent[] {
    const events: AstrologicalEvent[] = [];
    
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
            const status = currRetro ? "begins retrograde" : "goes direct";
            events.push({
              date: new Date(currentDate),
              type: 'retrograde_change',
              description: `${planet} ${status} in ${sign}`
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
        const status = currRetro ? "begins retrograde" : "goes direct";
        events.push({
          date: new Date(currentDate),
          type: 'retrograde_change',
          description: `${planet} ${status}`
        });
      }
    }
    
    return events;
  }
}

class AspectDetector extends EventDetector {
  private planetPairs: [string, string][];
  private aspects: string[];

  constructor(planetPairs?: [string, string][], aspects?: string[]) {
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

  detect(currentDate: Date, currentData: PlanetaryData, previousData: PlanetaryData | null): AstrologicalEvent[] {
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
            description: `${p1} ${aspect} ${p2}`
          });
        }
      }
    }
    
    return events;
  }
}

class PlanetarySignConfiguration extends EventDetector {
  private configurationName: string;
  private planetSignPairs: [string, string][];

  constructor(configurationName: string, planetSignPairs: [string, string][]) {
    super();
    this.configurationName = configurationName;
    this.planetSignPairs = planetSignPairs;
  }

  detect(currentDate: Date, currentData: PlanetaryData, previousData: PlanetaryData | null): AstrologicalEvent[] {
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
      const planetDescriptions = this.planetSignPairs.map(([planet, sign]) => `${planet} in ${sign}`);
      const description = `${this.configurationName}: ${planetDescriptions.join(", ")}`;
      
      events.push({
        date: new Date(currentDate),
        type: 'configuration',
        description
      });
    }
    
    return events;
  }
}

// Main scanner class
class AstrologicalEventScanner extends EventEmitter {
  private startDate: Date;
  private endDate: Date;
  private eventDetectors: EventDetector[];
  private isRunning: boolean = false;

  constructor(startDate: Date, endDate: Date, eventDetectors: EventDetector[]) {
    super();
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.eventDetectors = eventDetectors;
  }

  async scan(): Promise<AstrologicalEvent[]> {
    const allEvents: AstrologicalEvent[] = [];
    let currentDate = new Date(this.startDate);
    let previousData: PlanetaryData | null = null;
    
    this.isRunning = true;
    this.emit('start', { startDate: this.startDate, endDate: this.endDate });
    
    console.log(`Scanning for astrological events from ${this.startDate.toDateString()} to ${this.endDate.toDateString()}...`);
    
    while (currentDate <= this.endDate && this.isRunning) {
      const jd = julianDayFromDate(currentDate);
      
      // Get current positions and data for all planets
      const currentData: PlanetaryData = {};
      for (const [planetName, planetId] of Object.entries(PLANETS)) {
        currentData[planetName] = getPlanetData(jd, planetId);
      }
      
      // Run all event detectors
      for (const detector of this.eventDetectors) {
        const events = detector.detect(currentDate, currentData, previousData);
        allEvents.push(...events);
        
        // Emit events as they're found
        for (const event of events) {
          this.emit('event', event);
        }
      }
      
      // Store current data for next iteration
      previousData = currentData;
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Emit progress update (every 30 days)
      if (currentDate.getDate() === 1) {
        const progress = {
          currentDate: new Date(currentDate),
          eventsFound: allEvents.length,
          percentComplete: Math.round(
            ((currentDate.getTime() - this.startDate.getTime()) / 
            (this.endDate.getTime() - this.startDate.getTime())) * 100
          )
        };
        this.emit('progress', progress);
      }
      
      // Allow other operations to proceed by yielding the event loop
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    this.emit('complete', { eventsFound: allEvents.length });
    this.isRunning = false;
    return allEvents;
  }

  stop(): void {
    this.isRunning = false;
    this.emit('stopped', { reason: 'User requested stop' });
  }

  displayEvents(events: AstrologicalEvent[]): void {
    if (!events.length) {
      console.log("No events found.");
      return;
    }
    
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log(`Found ${events.length} events:`);
    console.log("-".repeat(70));
    
    for (const event of events) {
      const dateStr = event.date.toISOString().split('T')[0];
      console.log(`${dateStr} | ${event.type.toUpperCase().padEnd(15)} | ${event.description}`);
    }
  }
}

// Setup and execute
async function main() {
  // Create event detectors
  const detectors: EventDetector[] = [
    // Focus on Jupiter, Saturn, and outer planets in Aquarius
    new SignIngressDetector(
      ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
      ['Aquarius']
    ),
    
    // Retrograde motion in Aquarius
    new RetrogradeDetector(
      ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
      ['Aquarius']
    ),
    
    // Major aspects between outer planets
    new AspectDetector(
      [
        ['Jupiter', 'Saturn'], ['Jupiter', 'Uranus'], 
        ['Jupiter', 'Neptune'], ['Jupiter', 'Pluto'],
        ['Saturn', 'Uranus'], ['Saturn', 'Neptune'], 
        ['Saturn', 'Pluto'], ['Uranus', 'Neptune'],
        ['Uranus', 'Pluto'], ['Neptune', 'Pluto']
      ],
      ['conjunction', 'opposition', 'square', 'trine']
    ),
    
    // Example of a specific configuration detector
    new PlanetarySignConfiguration(
      "Multiple planets in Aquarius",
      [['Jupiter', 'Aquarius'], ['Saturn', 'Aquarius']]
    )
  ];
  
  // Create scanner
  const scanner = new AstrologicalEventScanner(START_DATE, END_DATE, detectors);
  
  // Set up event listeners
  scanner.on('start', (info) => {
    console.log(`Scan started: ${info.startDate.toDateString()} to ${info.endDate.toDateString()}`);
  });
  
  scanner.on('progress', (progress) => {
    console.log(`Progress: ${progress.percentComplete}% complete (${progress.currentDate.toDateString()})`);
  });
  
  scanner.on('complete', (result) => {
    console.log(`Scan complete. Found ${result.eventsFound} events.`);
  });
  
  // Run the scan
  const events = await scanner.scan();
  scanner.displayEvents(events);
}

// Run the program
main().catch(error => {
  console.error("An error occurred:", error);
});