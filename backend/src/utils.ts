import * as sweph from 'sweph';
import type { AspectName, PlanetData, SignName, JulianDate } from './types';
import { ASPECTS, SIGNS } from './constants';

// Initialize ephemeris (only if not already initialized)
try {
  sweph.set_ephe_path('../ephemeris');

  // Set observer's geographical location (San Francisco)
  sweph.set_topo(-122.4194, 37.7749, 0); // longitude (west is negative), latitude, altitude
} catch (error) {
  console.error('Error initializing ephemeris:', error);
}

export const isoToJulianDay = (isoString: string): number => {
  // Parse ISO string directly with regex
  const regex =
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|([+-])(\d{2}):(\d{2}))?)?$/;
  const match = regex.exec(isoString);

  if (!match) {
    throw new Error(`Invalid ISO date format: ${isoString}`);
  }

  // Extract components
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // Handle time part (defaults to 0 if not provided)
  const hour = match[4] ? parseInt(match[4], 10) : 0;
  const minute = match[5] ? parseInt(match[5], 10) : 0;
  const second = match[6] ? parseInt(match[6], 10) : 0;

  // Calculate hour fraction for sweph.julday
  const hourFraction = hour + minute / 60 + second / 3600;

  // Use Gregorian calendar for dates after 1582-10-15, Julian before
  const isGregorian =
    year > 1582 || (year === 1582 && month > 10) || (year === 1582 && month === 10 && day >= 15);

  const calendarFlag = isGregorian ? sweph.constants.SE_GREG_CAL : sweph.constants.SE_JUL_CAL;

  return sweph.julday(year, month, day, hourFraction, calendarFlag);
};

export function julianDayToIso(jd: JulianDate): string {
  // Determine calendar flag based on Julian Day Number
  // 2299160.5 is the cutover point (October 4/15, 1582)
  const calendarFlag = jd >= 2299160.5 ? sweph.constants.SE_GREG_CAL : sweph.constants.SE_JUL_CAL;

  // Convert Julian Day to UTC components
  const { year, month, day, hour, minute, second } = sweph.jdut1_to_utc(jd, calendarFlag);

  // Format date components
  const formattedYear = Math.abs(year).toString().padStart(4, '0');
  const yearSign = year < 0 ? '-' : '';
  const formattedMonth = month.toString().padStart(2, '0');
  const formattedDay = day.toString().padStart(2, '0');

  // Format time components
  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinute = minute.toString().padStart(2, '0');
  const formattedSecond = second.toFixed(3).padStart(6, '0');

  // Construct ISO string
  return `${yearSign}${formattedYear}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}:${formattedSecond}Z`;
}

export function getPlanetData(jd: number, planetId: number): PlanetData {
  const result = sweph.calc_ut(
    jd,
    planetId,
    sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED,
  );
  return {
    longitude: result.data[0], // Longitude is first element in data array
    retrograde: result.data[3] < 0, // Negative longitude speed means retrograde
  };
}

export function isInSign(position: number, signName: SignName): boolean {
  const start = SIGNS.get(signName)!;
  const normalizedPos = position % 360;
  return start <= normalizedPos && normalizedPos < (start + 30);
}

export function detectSign(position: number): SignName {
  const normalizedPos = position % 360;
  const signPos = Math.floor(normalizedPos / 30);

  // note that Maps guarantee object ordering, so this is a safe index
  const sign = Object.keys(SIGNS)[signPos] as SignName;
  return sign;
}

/**
 * Check if an aspect is valid based on both angular distance and sign distance
 */
export function checkAspect(
  pos1: number,
  pos2: number,
  aspectName: AspectName,
): number | undefined {
  const { angle, orb } = ASPECTS.get(aspectName)!;

  // Calculate the smallest angle between positions
  let diff = Math.abs(pos1 - pos2) % 360;
  if (diff > 180) {
    diff = 360 - diff;
  }
  const aspectOrb = Math.abs(diff - angle);

  // Check if within orb
  const isWithinOrb = aspectOrb <= orb;

  // If not within orb, no need to check sign compatibility
  if (!isWithinOrb) {
    return;
  }

  // Check sign compatibility based on aspect type
  const sign1 = Math.floor(pos1 / 30);
  const sign2 = Math.floor(pos2 / 30);
  const aspectSignDiff = Math.floor(angle / 30);
  let planetSignDiff = Math.abs(sign1 - sign2);
  if (planetSignDiff > 6) {
    planetSignDiff = 12 - planetSignDiff;
  }
  if (aspectSignDiff === planetSignDiff) {
    return aspectOrb;
  }
}
