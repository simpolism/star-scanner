export type EventType =
  | 'ingress'
  | 'retrograde'
  | 'aspect_begin'
  | 'aspect_peak'
  | 'aspect_end'
  | 'configuration';

export interface Planet {
  longitude: number;
  retrograde?: boolean;
}

export interface AstrologicalEvent {
  date: number; // julian day
  dateUTC: string;
  type: EventType;
  description: string;
  planets: Record<string, Planet>;
}

export interface EventsMetadata {
  generatedAt: string;
  startDate: string;
  endDate: string;
}

export interface EventsResponse {
  metadata: EventsMetadata;
  events: AstrologicalEvent[];
}
