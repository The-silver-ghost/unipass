import { Event, FreeEvent, PaidEvent, EventConfig } from './Event';
import { EventFactory } from './EventFactory';
import { API_BASE_URL } from '../config';

export interface CreateEventDTO {
  organizerId: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  basePrice: number;
  capacity: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export function mapDatabaseEventToEvent(dbEvent: any): Event {
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

  if (config.basePrice === 0) {
    return new FreeEvent(config);
  } else {
    return new PaidEvent(config);
  }
}

export class EventCreationController {
  
  public static async createNewEvent(data: CreateEventDTO): Promise<Event> {
    if (!data.title.trim() || !data.description.trim() || !data.date.trim() || !data.endDate.trim()) {
      throw new Error('All event configuration fields are required.');
    }

    if (data.capacity <= 0) {
      throw new Error('General admission capacity must be at least 1.');
    }

    if (data.basePrice > 0 && data.basePrice < 1.00) {
      throw new Error('Price must cover minimum RM1.00 processing fee');
    }

    if (data.basePrice > 0 && (!data.bankName.trim() || !data.accountNumber.trim() || !data.accountHolder.trim())) {
      throw new Error('Payout account details are required for paid events.');
    }

    try {
      const SERVER_URL = `${API_BASE_URL}/events`;
      console.log(`[Network] Dispatching payload to: ${SERVER_URL}`);

      const payload = {
        organizerId: data.organizerId,
        title: data.title,
        description: data.description,
        eventDate: data.date,
        eventEndDate: data.endDate,
        capacity: data.capacity,
        ticketPrice: data.basePrice,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolder: data.accountHolder,
      };

      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server rejected event registration.');
      }

      console.log('[EventCreationController] Database sync complete:', result.message);
      return await EventFactory.createEvent(result.event, true);

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
      return await Promise.all(result.events.map((e: any) => EventFactory.createEvent(e)));
    } catch (error) {
      console.error('[EventCreationController] Failed to fetch directory:', error);
      return [];
    }
  }

  public static async getEventDetails(eventId: string): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      const result = await response.json();
      if (!response.ok) throw new Error('Failed to retrieve event');
      return await EventFactory.createEvent(result.event);
    } catch (error: any) {
      console.error('[EventCreationController] Failed to fetch event details:', error);
      throw new Error(error.message || 'Network connection failed while fetching event.');
    }
  }

  public static async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/events?organizerId=${organizerId}`);
      const result = await response.json();
      if (!response.ok) throw new Error('Failed to retrieve events for organizer');
      return await Promise.all(result.events.map((e: any) => EventFactory.createEvent(e)));
    } catch (error) {
      console.error('[EventCreationController] Failed to fetch organizer directory:', error);
      return [];
    }
  }

  public static async updateEvent(eventId: string, description: string, capacity: number, eventDate?: string, eventEndDate?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, capacity, eventDate, eventEndDate })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update event');
    } catch (error: any) {
      console.error('[EventCreationController] Failed to update event:', error);
      throw new Error(error.message || 'Network connection failed while updating event.');
    }
  }

  public static async cancelEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/cancel`, {
        method: 'PUT'
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to cancel event');
    } catch (error: any) {
      console.error('[EventCreationController] Failed to cancel event:', error);
      throw new Error(error.message || 'Network connection failed while cancelling event.');
    }
  }

  public static async deleteEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete event');
    } catch (error: any) {
      console.error('[EventCreationController] Failed to delete event:', error);
      throw new Error(error.message || 'Network connection failed while deleting event.');
    }
  }
}
