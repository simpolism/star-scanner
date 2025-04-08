import { ASPECTS, COLORS, PLANETS, SIGNS } from './constants';

export type PlanetName = keyof typeof PLANETS;
export type SignName = keyof typeof SIGNS;
export type AspectName = keyof typeof ASPECTS;

export interface PlanetData {
  longitude: number;
  latitude: number;
  distance: number;
  speedLong: number;
  speedLat: number;
  speedDist: number;
  retrograde: boolean;
}

export interface PlanetaryData {
  [planet: string]: PlanetData;
}

// Use colors as shorthand for event types
export type EventType = keyof typeof COLORS.TYPE_COLORS;

export interface AstrologicalEvent<DataT = unknown> {
  date: Date;
  type: EventType;
  description: string;
  planets?: PlanetaryData;
  data?: DataT;
}

export abstract class EventDetector<DataT = unknown> {
  abstract detect(
    currentDate: Date,
    currentData: PlanetaryData,
    previousDate: Date | null,
    previousData: PlanetaryData | null,
    previousData2?: PlanetaryData | null, // for going back two timesteps to see direction shifts
  ): AstrologicalEvent<DataT>[];
}

export type EventProcessor = (evt: AstrologicalEvent) => string | undefined;
