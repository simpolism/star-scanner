import * as sweph from 'sweph';
import { Degree, SignName, PlanetName, AspectName } from './types';

export const PLANETS = new Map<PlanetName, number>([
  ['Sun', sweph.constants.SE_SUN],
  ['Moon', sweph.constants.SE_MOON],
  ['Mercury', sweph.constants.SE_MERCURY],
  ['Venus', sweph.constants.SE_VENUS],
  ['Mars', sweph.constants.SE_MARS],
  ['Jupiter', sweph.constants.SE_JUPITER],
  ['Saturn', sweph.constants.SE_SATURN],
  ['Uranus', sweph.constants.SE_URANUS],
  ['Neptune', sweph.constants.SE_NEPTUNE],
  ['Pluto', sweph.constants.SE_PLUTO],
]);

export const SIGNS = new Map<SignName, Degree>([
  ['Aries', 0],
  ['Taurus', 30],
  ['Gemini', 60],
  ['Cancer', 90],
  ['Leo', 120],
  ['Virgo', 150],
  ['Libra', 180],
  ['Scorpio', 210],
  ['Sagittarius', 240],
  ['Capricorn', 270],
  ['Aquarius', 300],
  ['Pisces', 330],
]);

export const ASPECTS = new Map<AspectName, Degree>([
  ['conjunction', 0.0],
  ['opposition', 180.0],
  ['trine', 120.0],
  ['square', 90.0],
  ['sextile', 60.0],
]);
