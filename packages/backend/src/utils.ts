import sweph from './sweph';
import type { AspectName, EventType, PlanetData, SignName } from "./types";
import { ASPECTS, COLORS, SIGNS } from "./constants";

export function julianDayFromDate(date: Date): number {
  // Convert to UTC time
  const utcDate = new Date(date);

  return sweph.julday(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcDate.getUTCHours() +
      utcDate.getUTCMinutes() / 60 +
      utcDate.getUTCSeconds() / 3600,
    sweph.constants.SE_GREG_CAL
  );
}

export function getPlanetData(jd: number, planetId: number): PlanetData {
  const result = sweph.calc_ut(jd, planetId, sweph.constants.SEFLG_SWIEPH);
  return {
    longitude: result.data[0], // Longitude is first element in data array
    retrograde: result.data[3] < 0, // Negative longitude speed means retrograde
  };
}

export function isInSign(position: number, signName: SignName): boolean {
  const [start, end] = SIGNS[signName];
  const normalizedPos = position % 360;
  return start <= normalizedPos && normalizedPos < end;
}

export function detectSign(position: number): SignName {
  for (const sign of Object.keys(SIGNS) as SignName[]) {
    if (isInSign(position, sign)) return sign;
  }
  throw new Error("Invalid position");
}

/**
 * Check if an aspect is valid based on both angular distance and sign distance
 */
export function checkAspect(
  pos1: number,
  pos2: number,
  aspectName: AspectName
): number | undefined {
  const { angle, orb } = ASPECTS[aspectName];

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

/**
 * Colorize text elements in an astrological event description
 * Adds appropriate colors to planets, signs, aspects, and event types
 */
export function colorizeText(text: string): string {
  let colorized = text;
  const reset = COLORS.RESET;

  // Colorize planets
  Object.entries(COLORS.PLANET_COLORS).forEach(([planet, color]) => {
    const regex = new RegExp(`\\b${planet}\\b`, "g");
    colorized = colorized.replace(regex, `${color}${planet}${reset}`);
  });

  // Colorize signs
  Object.entries(COLORS.SIGN_COLORS).forEach(([sign, color]) => {
    const regex = new RegExp(`\\b${sign}\\b`, "g");
    colorized = colorized.replace(regex, `${color}${sign}${reset}`);
  });

  // Colorize aspects
  Object.entries(COLORS.ASPECT_COLORS).forEach(([aspect, color]) => {
    const regex = new RegExp(`\\b${aspect}\\b`, "g");
    colorized = colorized.replace(regex, `${color}${aspect}${reset}`);
  });

  return colorized;
}

/**
 * Colorize an event type
 */
export function colorizeEventType(type: EventType): string {
  const typeColor = COLORS.TYPE_COLORS[type] || "";
  return `${typeColor}${type.toUpperCase()}${COLORS.RESET}`;
}
