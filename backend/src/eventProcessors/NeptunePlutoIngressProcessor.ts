import { IngressData } from '../eventDetectors';
import { AstrologicalEvent, EventProcessor } from '../types';

export const NeptunePlutoIngressProcessor: EventProcessor = (evt: AstrologicalEvent) => {
  if (evt.type === 'ingress') {
    const planet = (evt.data as IngressData)?.planet;
    if (planet === 'Neptune' || planet === 'Pluto') {
      return `${planet} Enters ${(evt.data as IngressData).newSign.toUpperCase()}`;
    }
  }
};
