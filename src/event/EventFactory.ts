import { Event, FreeEvent, PaidEvent, EventConfig } from './Event';

export class EventFactory {
  public static createEvent(config: Omit<EventConfig, 'id' | 'createdAt'>): Event {
    const generatedId = Math.random().toString(36).substring(2, 9);
    const fullConfig: EventConfig = {
      ...config,
      id: generatedId,
      createdAt: new Date(),
    };

    if (config.basePrice === 0) {
      return new FreeEvent(fullConfig);
    } else {
      return new PaidEvent(fullConfig);
    }
  }
}