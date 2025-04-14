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

export async function loadEvents(): Promise<void> {
  loading.set(true);
  error.set(null);

  try {
    const apiUrl = import.meta.env.VITE_API_URL || '/.netlify/functions';
    const response = await fetch(`${apiUrl}/scan`);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();

    // Update stores with fetched data
    metadata.set(data.metadata);

    // Convert date strings to Date objects, ensure planets data exists, and sort by date
    const processedEvents = data.events.map((event: AstrologicalEvent) => ({
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
