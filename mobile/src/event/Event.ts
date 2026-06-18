export interface EventConfig {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  basePrice: number;
  capacity: number;
  status: string;
  createdAt: Date;
  participantCount: number;
}

export abstract class Event {
  public id: string;
  public organizerId: string;
  public title: string;
  public description: string;
  public date: string;
  public endDate: string;
  public basePrice: number;
  public capacity: number;
  public status: string;
  public createdAt: Date;
  public participantCount: number;

  constructor(config: EventConfig) {
    this.id = config.id;
    this.organizerId = config.organizerId;
    this.title = config.title;
    this.description = config.description;
    this.date = config.date;
    this.endDate = config.endDate;
    this.basePrice = config.basePrice;
    this.capacity = config.capacity;
    this.status = config.status;
    this.createdAt = config.createdAt;
    this.participantCount = config.participantCount;
  }

  abstract isPaid(): boolean;
}

export class FreeEvent extends Event {
  constructor(config: EventConfig) {
    super({ ...config, basePrice: 0 });
  }

  isPaid(): boolean {
    return false;
  }
}

export class PaidEvent extends Event {
  constructor(config: EventConfig) {
    super(config);
  }

  isPaid(): boolean {
    return true;
  }
}