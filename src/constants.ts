import * as sweph from 'sweph';

export const START_DATE = new Date(2025, 3, 5); // April 5, 2025
export const END_DATE = new Date(2027, 11, 31); // December 31, 2027

// Console colors for output formatting
export const COLORS = {
  // Planet colors
  PLANET_COLORS: {
    Sun: '\x1b[33m', // Yellow
    Moon: '\x1b[37m', // White
    Mercury: '\x1b[36m', // Cyan
    Venus: '\x1b[35m', // Magenta
    Mars: '\x1b[31m', // Red
    Jupiter: '\x1b[34m', // Blue
    Saturn: '\x1b[90m', // Gray
    Uranus: '\x1b[96m', // Light Cyan
    Neptune: '\x1b[94m', // Light Blue
    Pluto: '\x1b[95m', // Light Magenta
  },

  // Sign colors
  SIGN_COLORS: {
    Aries: '\x1b[31m', // Red (fire)
    Taurus: '\x1b[32m', // Green (earth)
    Gemini: '\x1b[33m', // Yellow (air)
    Cancer: '\x1b[36m', // Cyan (water)
    Leo: '\x1b[31m', // Red (fire)
    Virgo: '\x1b[32m', // Green (earth)
    Libra: '\x1b[33m', // Yellow (air)
    Scorpio: '\x1b[36m', // Cyan (water)
    Sagittarius: '\x1b[31m', // Red (fire)
    Capricorn: '\x1b[32m', // Green (earth)
    Aquarius: '\x1b[33m', // Yellow (air)
    Pisces: '\x1b[36m', // Cyan (water)
  },

  // Aspect colors
  ASPECT_COLORS: {
    conjunction: '\x1b[37m', // White
    opposition: '\x1b[31m', // Red
    trine: '\x1b[32m', // Green
    square: '\x1b[31m', // Red
    sextile: '\x1b[33m', // Yellow
  },

  // Event type colors
  TYPE_COLORS: {
    aspect: '\x1b[35m', // Magenta
    ingress: '\x1b[32m', // Green
    retrograde: '\x1b[33m', // Yellow
    configuration: '\x1b[36m', // Cyan
  },

  // Reset color
  RESET: '\x1b[0m',
};

export const PLANETS: { [name: string]: number } = {
  Sun: sweph.constants.SE_SUN,
  Moon: sweph.constants.SE_MOON,
  Mercury: sweph.constants.SE_MERCURY,
  Venus: sweph.constants.SE_VENUS,
  Mars: sweph.constants.SE_MARS,
  Jupiter: sweph.constants.SE_JUPITER,
  Saturn: sweph.constants.SE_SATURN,
  Uranus: sweph.constants.SE_URANUS,
  Neptune: sweph.constants.SE_NEPTUNE,
  Pluto: sweph.constants.SE_PLUTO,
};
export const SIGNS: { [name: string]: [number, number] } = {
  Aries: [0, 30],
  Taurus: [30, 60],
  Gemini: [60, 90],
  Cancer: [90, 120],
  Leo: [120, 150],
  Virgo: [150, 180],
  Libra: [180, 210],
  Scorpio: [210, 240],
  Sagittarius: [240, 270],
  Capricorn: [270, 300],
  Aquarius: [300, 330],
  Pisces: [330, 360],
};
export const ASPECTS: { [name: string]: { angle: number; orb: number } } = {
  conjunction: { angle: 0.0, orb: 8.0 },
  opposition: { angle: 180.0, orb: 8.0 },
  trine: { angle: 120.0, orb: 6.0 },
  square: { angle: 90.0, orb: 6.0 },
  sextile: { angle: 60.0, orb: 4.0 },
};
