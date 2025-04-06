import * as sweph from 'sweph';

export const START_DATE = new Date(2025, 3, 5); // April 5, 2025
export const END_DATE = new Date(2027, 11, 31); // December 31, 2027
export const PLANETS: { [name: string]: number } = {
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
