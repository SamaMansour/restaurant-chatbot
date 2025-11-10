import { Reservation } from '../domain/Reservation';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';

export class CreateReservationUseCase {
  constructor(
    private reservationRepository: ReservationRepository,
    private timeSlotRepository: TimeSlotRepository
  ) {}

  async execute(
    guestName: string,
    phoneNumber: string,
    partySize: number,
    reservationDate: Date,
    reservationTime: string
  ): Promise<Reservation> {
    const timeSlot = await this.timeSlotRepository.findByTime(reservationTime);
    if (!timeSlot) {
      throw new Error('Invalid time slot');
    }

    if (!timeSlot.hasCapacity(partySize)) {
      throw new Error('This time slot is fully booked');
    }

    const reservation = await this.reservationRepository.create(
      guestName,
      phoneNumber,
      partySize,
      reservationDate,
      reservationTime
    );

    return reservation;
  }
}
