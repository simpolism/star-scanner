import * as sweph from 'sweph';
import type { AspectName, PlanetData, SignName } from './types';
import { ASPECTS, COLORS, SIGNS } from './constants';

// Set observer's geographical location (San Francisco)
sweph.set_topo(-122.4194, 37.7749, 0); // longitude (west is negative), latitude, altitude

export function julianDayFromDate(date: Date): number {
  // Convert to UTC time
  const utcDate = new Date(date);
  
  return sweph.julday(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcDate.getUTCHours() + (utcDate.getUTCMinutes() / 60) + (utcDate.getUTCSeconds() / 3600),
    sweph.constants.SE_GREG_CAL,
  );
}

export function getPlanetData(jd: number, planetId: number): PlanetData {
  // Use SEFLG_TOPOCTR flag for topocentric calculations
  const result = sweph.calc(jd, planetId, 
    sweph.constants.SEFLG_SWIEPH | 
    sweph.constants.SEFLG_SPEED | 
    sweph.constants.SEFLG_TOPOCTR
  );
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

export function detectSign(position: number): SignName {
  for (const sign in SIGNS) {
    if (isInSign(position, sign)) return sign as SignName;
  }
  throw new Error('Invalid position');
}

/**
 * Get the sign index (0-11) from a longitude position
 */
export function getSignIndex(position: number): number {
  return Math.floor((position % 360) / 30);
}

/**
 * Calculate how many signs apart two positions are (0-11)
 * Used to validate astrological aspects are "in sign"
 */
export function getSignDistance(pos1: number, pos2: number): number {
  const sign1 = getSignIndex(pos1);
  const sign2 = getSignIndex(pos2);

  // Get shortest distance between signs (clockwise or counterclockwise)
  const diff = Math.abs(sign1 - sign2);
  return diff > 6 ? 12 - diff : diff;
}

/**
 * Check if an aspect is valid based on both angular distance and sign distance
 */
export function checkAspect(pos1: number, pos2: number, aspectName: AspectName): boolean {
  const { angle, orb } = ASPECTS[aspectName];

  // Calculate the smallest angle between positions
  let diff = Math.abs(pos1 - pos2) % 360;
  if (diff > 180) {
    diff = 360 - diff;
  }

  // Check if within orb
  const isWithinOrb = Math.abs(diff - angle) <= orb;

  // If not within orb, no need to check sign compatibility
  if (!isWithinOrb) {
    return false;
  }

  // Check sign compatibility based on aspect type
  const signDistance = getSignDistance(pos1, pos2);

  switch (aspectName) {
    case 'conjunction':
      return signDistance === 0; // Same sign
    case 'opposition':
      return signDistance === 6; // Opposite signs
    case 'trine':
      return signDistance === 4 || signDistance === 8; // Same element (4 signs apart)
    case 'square':
      return signDistance === 3 || signDistance === 9; // Same modality (3 signs apart)
    case 'sextile':
      return signDistance === 2 || signDistance === 10; // Compatible elements (2 signs apart)
    default:
      return true; // For any other aspects, don't apply sign restrictions
  }
}

/**
 * Colorize text elements in an astrological event description
 * Adds appropriate colors to planets, signs, aspects, and event types
 */
export function colorizeText(text: string): string {
  let colorized = text;
  const reset = COLORS.RESET;

  // Colorize planets
  Object.entries(COLORS.PLANET_COLORS).forEach(([planet, color]) => {
    const regex = new RegExp(`\\b${planet}\\b`, 'g');
    colorized = colorized.replace(regex, `${color}${planet}${reset}`);
  });

  // Colorize signs
  Object.entries(COLORS.SIGN_COLORS).forEach(([sign, color]) => {
    const regex = new RegExp(`\\b${sign}\\b`, 'g');
    colorized = colorized.replace(regex, `${color}${sign}${reset}`);
  });

  // Colorize aspects
  Object.entries(COLORS.ASPECT_COLORS).forEach(([aspect, color]) => {
    const regex = new RegExp(`\\b${aspect}\\b`, 'g');
    colorized = colorized.replace(regex, `${color}${aspect}${reset}`);
  });

  return colorized;
}

/**
 * Colorize an event type
 */
export function colorizeEventType(type: keyof typeof COLORS.TYPE_COLORS): string {
  const typeColor = COLORS.TYPE_COLORS[type] || '';
  return `${typeColor}${type.toUpperCase()}${COLORS.RESET}`;
}
