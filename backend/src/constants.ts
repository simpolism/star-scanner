import * as sweph from 'sweph';

export const PLANETS = {
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
export const SIGNS = {
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
export const ASPECTS = {
  conjunction: { angle: 0.0, orb: 5.0 },
  opposition: { angle: 180.0, orb: 5.0 },
  trine: { angle: 120.0, orb: 5.0 },
  square: { angle: 90.0, orb: 5.0 },
  sextile: { angle: 60.0, orb: 2.0 },
};
