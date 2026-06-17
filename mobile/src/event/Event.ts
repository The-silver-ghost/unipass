export interface EventConfig {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  date: string;
  basePrice: number;
  capacity: number;
  status: string;
  createdAt: Date;
}

export abstract class Event {
  public id: string;
  public organizerId: string;
  public title: string;
  public description: string;
  public date: string;
  public basePrice: number;
  public capacity: number;
  public status: string;
  public createdAt: Date;

  constructor(config: EventConfig) {
    this.id = config.id;
    this.organizerId = config.organizerId;
    this.title = config.title;
    this.description = config.description;
    this.date = config.date;
    this.basePrice = config.basePrice;
    this.capacity = config.capacity;
    this.status = config.status;
    this.createdAt = config.createdAt;
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