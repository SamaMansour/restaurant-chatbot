import { Reservation } from '../domain/Reservation';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';

export class UpdateReservationUseCase {
  constructor(
    private reservationRepository: ReservationRepository,
    private timeSlotRepository: TimeSlotRepository
  ) {}

  async execute(
    id: string | number,
    partySize?: number,
    reservationDate?: Date,
    reservationTime?: string
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservationTime && reservationTime !== reservation.reservationTime) {
      const oldSlot = await this.timeSlotRepository.findByTime(reservation.reservationTime);
      if (oldSlot) {
        const releasedSlot = oldSlot.release(reservation.partySize);
        await this.timeSlotRepository.update(releasedSlot);
      }

      const newSlot = await this.timeSlotRepository.findByTime(reservationTime);
      if (!newSlot) {
        throw new Error('Invalid time slot');
      }

      const effectivePartySize = partySize ?? reservation.partySize;
      if (!newSlot.hasCapacity(effectivePartySize)) {
        throw new Error('This time slot is fully booked');
      }

      const reservedSlot = newSlot.reserve(effectivePartySize);
      await this.timeSlotRepository.update(reservedSlot);
    } else if (partySize && partySize !== reservation.partySize) {
      const slot = await this.timeSlotRepository.findByTime(reservation.reservationTime);
      if (!slot) {
        throw new Error('Time slot not found');
      }

      const sizeDiff = partySize - reservation.partySize;
      if (sizeDiff > 0) {
        if (!slot.hasCapacity(sizeDiff)) {
          throw new Error('Not enough capacity for party size increase');
        }
        const updatedSlot = slot.reserve(sizeDiff);
        await this.timeSlotRepository.update(updatedSlot);
      } else {
        const updatedSlot = slot.release(Math.abs(sizeDiff));
        await this.timeSlotRepository.update(updatedSlot);
      }
    }

    const updated = reservation.updateDetails(partySize, reservationDate, reservationTime);
    return await this.reservationRepository.update(updated);
  }
}
