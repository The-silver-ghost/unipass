import { Event, FreeEvent, PaidEvent, EventConfig } from './Event';
import { EventFactory } from './EventFactory';
import { API_BASE_URL } from '../config';

export interface CreateEventDTO {
  organizerId: string;
  title: string;
  description: string;
  date: string;
  basePrice: number;
  capacity: number;
}

// Maps backend DB snake_case payload into typed frontend Event object instances
export function mapDatabaseEventToEvent(dbEvent: any): Event {
  const config: EventConfig = {
    id: dbEvent.id,
    organizerId: dbEvent.organizer_id,
    title: dbEvent.title,
    description: dbEvent.description,
    date: dbEvent.event_date,
    basePrice: typeof dbEvent.ticket_price === 'string' ? parseFloat(dbEvent.ticket_price) : dbEvent.ticket_price,
    capacity: Number(dbEvent.capacity),
    createdAt: new Date(dbEvent.created_at)
  };

  if (config.basePrice === 0) {
    return new FreeEvent(config);
  } else {
    return new PaidEvent(config);
  }
}

export class EventCreationController {
  
  public static async createNewEvent(data: CreateEventDTO): Promise<Event> {
    // Basic Field Validations
    if (!data.title.trim() || !data.description.trim() || !data.date.trim()) {
      throw new Error('All event configuration fields are required.');
    }

    if (data.capacity <= 0) {
      throw new Error('General admission capacity must be at least 1.');
    }

    // Price Below Gateway Minimum Rule (RM1.00 local minimum fee)
    if (data.basePrice > 0 && data.basePrice < 1.00) {
      throw new Error('Price must cover minimum RM1.00 processing fee');
    }

    try {
      const SERVER_URL = `${API_BASE_URL}/events`;
      console.log(`[Network] Dispatching payload to: ${SERVER_URL}`);

      // Structure the payload
      const payload = {
        organizerId: data.organizerId, // Will be passed in from the UI layer
        title: data.title,
        description: data.description,
        eventDate: data.date,
        capacity: data.capacity,
        ticketPrice: data.basePrice,
      };

      // Execute network call
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server rejected event registration.');
      }

      console.log('[EventCreationController] Database sync complete:', result.message);
      
      // Return the complete event object mapped from the database response
      return mapDatabaseEventToEvent(result.event);

    } catch (error: any) {
      console.error('[EventCreationController] Critical workflow failure:', error);
      throw new Error(error.message || 'Network connection failed. Verify your server is active.');
    }
  }

  public static async getPublishedEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const result = await response.json();
      
      if (!response.ok) throw new Error('Failed to retrieve events');
      return result.events.map((e: any) => mapDatabaseEventToEvent(e));
    } catch (error) {
      console.error('[EventCreationController] Failed to fetch directory:', error);
      return [];
    }
  }

  public static async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/events?organizerId=${organizerId}`);
      const result = await response.json();
      
      if (!response.ok) throw new Error('Failed to retrieve events for organizer');
      return result.events.map((e: any) => mapDatabaseEventToEvent(e));
    } catch (error) {
      console.error('[EventCreationController] Failed to fetch organizer directory:', error);
      return [];
    }
  }

  public static async updateEvent(eventId: string, description: string, capacity: number): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, capacity })
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Failed to update event');
      return mapDatabaseEventToEvent(result.event);
    } catch (error: any) {
      console.error('[EventCreationController] Failed to update event:', error);
      throw new Error(error.message || 'Network connection failed while updating event.');
    }
  }
}