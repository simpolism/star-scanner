export interface Planet {
  longitude: number;
  retrograde: boolean;
}

export interface AstrologicalEvent {
  date: string; // ISO string from API
  type: 'ingress' | 'retrograde' | 'aspect_begin' | 'aspect_peak' | 'aspect_end' | 'configuration';
  description: string;
  planets?: Record<string, Planet>;
  processedOutputs?: string[];
}

export interface EventsData {
  metadata: {
    startDate: string;
    endDate: string;
    generatedAt: string;
    totalEvents: number;
  };
  events: AstrologicalEvent[];
}

export interface FilterState {
  eventType: string;
  planet: string;
  year: string;
}
