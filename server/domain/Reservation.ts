export class Reservation {
  constructor(
    public readonly id: string | number,
    public readonly guestName: string,
    public readonly phoneNumber: string,
    public readonly partySize: number,
    public readonly reservationDate: Date,
    public readonly reservationTime: string,
    public readonly status: 'pending' | 'confirmed' | 'cancelled',
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  isActive(): boolean {
    return this.status !== 'cancelled';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  confirm(): Reservation {
    return new Reservation(
      this.id,
      this.guestName,
      this.phoneNumber,
      this.partySize,
      this.reservationDate,
      this.reservationTime,
      'confirmed',
      this.createdAt,
      new Date()
    );
  }

  cancel(): Reservation {
    return new Reservation(
      this.id,
      this.guestName,
      this.phoneNumber,
      this.partySize,
      this.reservationDate,
      this.reservationTime,
      'cancelled',
      this.createdAt,
      new Date()
    );
  }

  updateDetails(
    partySize?: number,
    reservationDate?: Date,
    reservationTime?: string
  ): Reservation {
    return new Reservation(
      this.id,
      this.guestName,
      this.phoneNumber,
      partySize ?? this.partySize,
      reservationDate ?? this.reservationDate,
      reservationTime ?? this.reservationTime,
      this.status,
      this.createdAt,
      new Date()
    );
  }
}
