export class TimeSlot {
  constructor(
    public readonly id: string | number,
    public readonly time: string,
    public readonly capacity: number,
    public readonly availableSlots: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  isAvailable(): boolean {
    return this.availableSlots > 0;
  }

  hasCapacity(partySize: number): boolean {
    return this.availableSlots >= partySize;
  }

  reserve(partySize: number): TimeSlot {
    if (!this.hasCapacity(partySize)) {
      throw new Error(`Not enough capacity. Available: ${this.availableSlots}, Requested: ${partySize}`);
    }

    return new TimeSlot(
      this.id,
      this.time,
      this.capacity,
      this.availableSlots - partySize,
      this.createdAt,
      new Date()
    );
  }

  release(partySize: number): TimeSlot {
    const newAvailable = Math.min(this.availableSlots + partySize, this.capacity);

    return new TimeSlot(
      this.id,
      this.time,
      this.capacity,
      newAvailable,
      this.createdAt,
      new Date()
    );
  }
}
