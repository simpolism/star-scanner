export type JulianDate = number;
export type Degree = number;

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

export interface BaseDetectorConfig {
  enabled: boolean;
}

export abstract class EventDetector<
  DataT = unknown,
  ConfigT extends BaseDetectorConfig = BaseDetectorConfig,
> {
  protected config: ConfigT;

  constructor(config: ConfigT) {
    this.config = config;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  abstract detect(
    currentDate: JulianDate,
    currentData: PlanetaryData,
    previousDate: JulianDate | null,
    previousData: PlanetaryData | null,
    previousData2?: PlanetaryData | null, // for going back two timesteps to see direction shifts
  ): AstrologicalEvent<DataT>[];
}

export type EventProcessor = (evt: AstrologicalEvent) => string | undefined;
