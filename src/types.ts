import { ASPECTS, COLORS, PLANETS, SIGNS } from './constants';

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

export type PlanetName = keyof typeof PLANETS;
export type SignName = keyof typeof SIGNS;
export type AspectName = keyof typeof ASPECTS;

// Use colors as shorthand for event types
export type EventType = keyof typeof COLORS.TYPE_COLORS;

export interface AstrologicalEvent<DataT = unknown> {
  date: Date;
  type: EventType;
  description: string;
  data?: DataT;
}

export abstract class EventDetector<DataT = unknown> {
  abstract detect(
    currentDate: Date,
    currentData: PlanetaryData,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent<DataT>[];
}

export type EventProcessor = (evt: AstrologicalEvent) => string | undefined;
