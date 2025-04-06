import * as sweph from 'sweph';
import type { AspectName, PlanetData, SignName } from './types';
import { ASPECTS, SIGNS } from './constants';

export function julianDayFromDate(date: Date): number {
  return sweph.julday(
    date.getFullYear(),
    date.getMonth() + 1, // JavaScript months are 0-based
    date.getDate(),
    0,
    sweph.constants.SE_GREG_CAL,
  );
}

export function getPlanetData(jd: number, planetId: number): PlanetData {
  const result = sweph.calc(jd, planetId, sweph.constants.SEFLG_SPEED);
  return {
    longitude: result.data[0], // Longitude is first element in data array
    latitude: result.data[1], // Latitude is second element
    distance: result.data[2], // Distance is third element
    speedLong: result.data[3], // Longitude speed is fourth element
    speedLat: result.data[4], // Latitude speed is fifth element
    speedDist: result.data[5], // Distance speed is sixth element
    retrograde: result.data[3] < 0, // Negative longitude speed means retrograde
  };
}

export function isInSign(position: number, signName: SignName): boolean {
  const [start, end] = SIGNS[signName];
  const normalizedPos = position % 360;
  return start <= normalizedPos && normalizedPos < end;
}

export function checkAspect(pos1: number, pos2: number, aspectName: AspectName): boolean {
  const { angle, orb } = ASPECTS[aspectName];

  // Calculate the smallest angle between positions
  let diff = Math.abs(pos1 - pos2) % 360;
  if (diff > 180) {
    diff = 360 - diff;
  }

  // Check if within orb
  return Math.abs(diff - angle) <= orb;
}
