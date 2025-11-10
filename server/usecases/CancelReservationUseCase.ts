import { Reservation } from '../domain/Reservation';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';

export class CancelReservationUseCase {
  constructor(
    private reservationRepository: ReservationRepository,
    private timeSlotRepository: TimeSlotRepository
  ) {}

  async execute(id: string | number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const timeSlot = await this.timeSlotRepository.findByTime(reservation.reservationTime);
    if (timeSlot) {
      const releasedSlot = timeSlot.release(reservation.partySize);
      await this.timeSlotRepository.update(releasedSlot);
    }

    const cancelled = reservation.cancel();
    return await this.reservationRepository.update(cancelled);
  }
}
