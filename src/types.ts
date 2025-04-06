import { ASPECTS, PLANETS, SIGNS } from './constants';

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

export interface AstrologicalEvent {
  date: Date;
  type: string;
  description: string;
}

export abstract class EventDetector {
  abstract detect(
    currentDate: Date,
    currentData: PlanetaryData,
    previousData: PlanetaryData | null,
  ): AstrologicalEvent[];
}

export type PlanetName = keyof typeof PLANETS;
export type SignName = keyof typeof SIGNS;
export type AspectName = keyof typeof ASPECTS;
