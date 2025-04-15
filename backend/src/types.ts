export type JulianDate = number;
export type Degree = number;
export interface Aspect {
  angle: Degree;
  orb: Degree;
}

export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

export type SignName =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type AspectName =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile';

export interface PlanetData {
  longitude: Degree;
  retrograde: boolean;
}

export interface PlanetaryData {
  [planet: string]: PlanetData;
}

// Use colors as shorthand for event types
export type EventType =
  | 'aspect_begin'
  | 'aspect_end'
  | 'aspect_peak'
  | 'ingress'
  | 'retrograde'
  | 'configuration';

export interface AstrologicalEvent<DataT = unknown> {
  date: JulianDate;
  type: EventType;
  description: string;
  planets?: PlanetaryData;
  data?: DataT;
}

export abstract class EventDetector<DataT = unknown> {
  abstract detect(
    currentDate: JulianDate,
    currentData: PlanetaryData,
    previousDate: JulianDate | null,
    previousData: PlanetaryData | null,
    previousData2?: PlanetaryData | null, // for going back two timesteps to see direction shifts
  ): AstrologicalEvent<DataT>[];
}

export type EventProcessor = (evt: AstrologicalEvent) => string | undefined;
