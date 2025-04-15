import { ASPECTS, PLANETS, SIGNS } from './constants';
import { JulianDate } from './utils';

export type PlanetName = keyof typeof PLANETS;
export type SignName = keyof typeof SIGNS;
export type AspectName = keyof typeof ASPECTS;

export interface PlanetData {
  longitude: number;
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
