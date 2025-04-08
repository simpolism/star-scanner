import { RetrogradeData } from '../eventDetectors';
import { AstrologicalEvent, EventProcessor } from '../types';

export const PlutoRetrogradeProcessor: EventProcessor = (evt: AstrologicalEvent) => {
  if (evt.type === 'retrograde' && (evt.data as RetrogradeData)?.planet === 'Pluto') {
    return `------------Pluto Goes ${(
      evt.data as RetrogradeData
    ).direction.toUpperCase()}----------------`;
  }
};
