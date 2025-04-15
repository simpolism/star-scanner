import { writable, get } from 'svelte/store';
import { loadEvents } from './eventStore';

// Default configuration
const defaultConfig = {
  timeSpan: {
    startTime: new Date(new Date().getFullYear(), 0, 1).toISOString(), // Start of current year
    endTime: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(), // Start of next year
  },
  detectors: {
    signIngressDetector: {
      enabled: true,
      planets: ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
    },
    retrogradeDetector: {
      enabled: true,
      planets: ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
      signs: [
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn',
        'Aquarius',
        'Pisces',
      ],
      checkSign: false,
    },
    aspectDetector: {
      enabled: true,
      planetPairs: [
        ['Jupiter', 'Saturn'],
        ['Jupiter', 'Uranus'],
        ['Jupiter', 'Neptune'],
        ['Jupiter', 'Pluto'],
        ['Saturn', 'Uranus'],
        ['Saturn', 'Neptune'],
        ['Saturn', 'Pluto'],
        ['Uranus', 'Neptune'],
        ['Uranus', 'Pluto'],
        ['Neptune', 'Pluto'],
      ],
      aspects: ['conjunction', 'opposition', 'square', 'trine'],
    },
  },
};

// Try to load saved configuration from localStorage
function loadSavedConfig() {
  if (typeof localStorage !== 'undefined') {
    const savedConfig = localStorage.getItem('starScannerConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Error parsing saved configuration:', e);
      }
    }
  }
  return defaultConfig;
}

// Create the config store
export const config = writable(loadSavedConfig());

// Save to localStorage when config changes
config.subscribe((value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('starScannerConfig', JSON.stringify(value));
  }
});

// Common planet options
export const planetOptions = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

// Common aspect options
export const aspectOptions = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];

// Zodiac sign options
export const signOptions = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

// Helper function to create all possible planet pairs
export function generateAllPlanetPairs(planets: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      pairs.push([planets[i], planets[j]]);
    }
  }
  return pairs;
}

// Apply configuration and load events
export async function applyConfig(): Promise<void> {
  await loadEvents(get(config));
}

// Presets for common configurations
export const presets = {
  currentYear: () => {
    const currentYear = new Date().getFullYear();
    config.update((c) => ({
      ...c,
      timeSpan: {
        startTime: new Date(currentYear, 0, 1).toISOString(),
        endTime: new Date(currentYear + 1, 0, 1).toISOString(),
      },
    }));
  },
  nextSixMonths: () => {
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6);

    config.update((c) => ({
      ...c,
      timeSpan: {
        startTime: today.toISOString(),
        endTime: sixMonthsLater.toISOString(),
      },
    }));
  },
  outerPlanetsOnly: () => {
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    config.update((c) => ({
      ...c,
      detectors: {
        ...c.detectors,
        signIngressDetector: {
          ...c.detectors.signIngressDetector,
          planets: outerPlanets,
        },
        retrogradeDetector: {
          ...c.detectors.retrogradeDetector,
          planets: outerPlanets,
        },
        aspectDetector: {
          ...c.detectors.aspectDetector,
          planetPairs: generateAllPlanetPairs(outerPlanets),
        },
      },
    }));
  },
  allPlanets: () => {
    const allPlanets = [
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
    ];

    config.update((c) => ({
      ...c,
      detectors: {
        ...c.detectors,
        signIngressDetector: {
          ...c.detectors.signIngressDetector,
          planets: allPlanets,
        },
        retrogradeDetector: {
          ...c.detectors.retrogradeDetector,
          planets: allPlanets,
        },
        aspectDetector: {
          ...c.detectors.aspectDetector,
          planetPairs: generateAllPlanetPairs(allPlanets.slice(0, 5)), // Limit pairs to avoid too many combinations
        },
      },
    }));
  },
};
