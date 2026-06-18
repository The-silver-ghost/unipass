import { Event, FreeEvent, PaidEvent, EventConfig } from './Event';
import { pauseDebug } from '../utils/debugPause';

export class EventFactory {
  public static async createEvent(dbEvent: any, triggerPause: boolean = false): Promise<Event> {
    const config: EventConfig = {
      id: dbEvent.id,
      organizerId: dbEvent.organizer_id,
      title: dbEvent.title,
      description: dbEvent.description,
      date: dbEvent.event_date,
      endDate: dbEvent.event_end_date,
      basePrice: typeof dbEvent.ticket_price === 'string' ? parseFloat(dbEvent.ticket_price) : dbEvent.ticket_price,
      capacity: Number(dbEvent.capacity),
      status: dbEvent.status,
      createdAt: new Date(dbEvent.created_at),
      participantCount: Number(dbEvent.participant_count || 0)
    };

    const isPaid = config.basePrice > 0;
    
    if (triggerPause) {
      // Dump details about event factory instantiation and pause the debugger
      await pauseDebug({
        pattern: "Factory Pattern (Event Creation)",
        action: "Instantiating Event object polymorphically via EventFactory",
        eventTitle: config.title,
        isPaid: isPaid,
        resolvedClass: isPaid ? "PaidEvent" : "FreeEvent"
      });
    }

    if (config.basePrice === 0) {
      return new FreeEvent(config);
    } else {
      return new PaidEvent(config);
    }
  }
}
