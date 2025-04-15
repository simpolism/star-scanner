import { writable } from 'svelte/store';
import type { AstrologicalEvent, EventsMetadata } from '../types/events';

// Store for all events
export const events = writable<AstrologicalEvent[]>([]);

// Store for metadata
export const metadata = writable<EventsMetadata>({
  generatedAt: '',
  startDate: '',
  endDate: '',
});

// Store for loading state
export const loading = writable<boolean>(true);

// Store for error state
export const error = writable<string | null>(null);

export async function loadEvents(config?: any): Promise<void> {
  loading.set(true);
  error.set(null);

  try {
    const apiUrl = import.meta.env.VITE_API_URL || '/.netlify/functions';

    const response = await fetch(`${apiUrl}/scan`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        startTime: config?.timeSpan?.startTime || new Date(2026, 0, 1).toISOString(),
        endTime: config?.timeSpan?.endTime || new Date(2027, 0, 1).toISOString(),
        detectors: config?.detectors || {
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
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        if (!errorData.message || !errorData.error) {
          throw new Error();
        }
      } catch (e) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      throw new Error(`${errorData.error}: ${errorData.message}`);
    }

    const data = await response.json();

    // Update stores with fetched data
    metadata.set(data.metadata);

    // Convert date strings to Date objects, ensure planets data exists, and sort by date
    const processedEvents: AstrologicalEvent[] = data.events.map((event: AstrologicalEvent) => ({
      ...event,
      date: event.date,
      planets: event.planets || {},
    }));

    // Sort events by date
    processedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    events.set(processedEvents);
  } catch (err) {
    console.error('Error loading event data:', err);
    error.set(err instanceof Error ? err.message : 'Unknown error occurred');
  } finally {
    loading.set(false);
  }
}
