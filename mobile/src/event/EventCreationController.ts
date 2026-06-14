import { Event } from './Event';
import { EventFactory } from './EventFactory';

export interface CreateEventDTO {
  organizerId: string;
  title: string;
  description: string;
  date: string;
  basePrice: number;
  capacity: number;
}

export class EventCreationController {
  // Mock database storage
  private static mockEventsTable: Event[] = [];

  /**
   * Orchestrates the UC-2.3 Create New Event workflow
   */
  public static createNewEvent(data: CreateEventDTO): Event {
    // 1. Basic Field Validations
    if (!data.title.trim() || !data.description.trim() || !data.date.trim()) {
      throw new Error('All event configuration fields are required.');
    }

    if (data.capacity <= 0) {
      throw new Error('General admission capacity must be at least 1.');
    }

    // 2. Alternative Flow 3a: Price Below Gateway Minimum Rule
    if (data.basePrice > 0 && data.basePrice < 1.00) {
      throw new Error('Price must cover minimum RM1.00 processing fee');
    }

    // 3. Instantiate Entity via Factory
    const newEvent = EventFactory.createEvent(data);

    // 4. Save to target storage (Mock array for now, swap with repository/DB later)
    this.mockEventsTable.push(newEvent);
    console.log('[EventCreationController] Event Published Successfully:', newEvent);

    return newEvent;
  }

  /**
   * Utility method to view published items on the student dashboard
   */
  public static getPublishedEvents(): Event[] {
    return this.mockEventsTable;
  }
}