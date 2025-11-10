import { Reservation } from '../domain/Reservation';
import { TimeSlot } from '../domain/TimeSlot';
import { ReservationMapper } from '../mappers/ReservationMapper';
import ReservationModel from '../database/models/Reservation';
import { TimeSlotRepository } from './TimeSlotRepository';
import { Op } from 'sequelize';

export class ReservationRepository {
  private timeSlotRepository: TimeSlotRepository;

  constructor() {
    this.timeSlotRepository = new TimeSlotRepository();
  }
  async create(
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

    const model = await ReservationModel.create({
      guestName: guestName,
      guestPhone: phoneNumber,
      partySize: partySize,
      reservationDate: reservationDate,
      reservationTime: reservationTime,
      status: 'confirmed',
    });

    const updatedSlot = timeSlot.reserve(partySize);
    await this.timeSlotRepository.update(updatedSlot);

    return ReservationMapper.toDomain(model);
  }

  async findById(id: string | number): Promise<Reservation | null> {
    const model = await ReservationModel.findByPk(id);
    return model ? ReservationMapper.toDomain(model) : null;
  }

  async findByPhone(phoneNumber: string): Promise<Reservation[]> {
    const models = await ReservationModel.findAll({
      where: {
        guestPhone: phoneNumber,
        status: {
          [Op.ne]: 'cancelled',
        },
      },
      order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']],
    });

    return models.map(model => ReservationMapper.toDomain(model));
  }

  async findByDateAndTime(date: Date, time: string): Promise<Reservation[]> {
    const models = await ReservationModel.findAll({
      where: {
        reservationDate: date.toISOString().split('T')[0],
        reservationTime: time,
        status: {
          [Op.ne]: 'cancelled',
        },
      },
    });

    return models.map(model => ReservationMapper.toDomain(model));
  }

  async update(reservation: Reservation): Promise<Reservation> {
    const model = await ReservationModel.findByPk(reservation.id);
    if (!model) {
      throw new Error(`Reservation with id ${reservation.id} not found`);
    }

    const updateData = ReservationMapper.toPersistence(reservation);
    await model.update(updateData);
    await model.reload();

    return ReservationMapper.toDomain(model);
  }

  async updateReservation(
    id: string | number,
    partySize?: number,
    reservationDate?: Date,
    reservationTime?: string
  ): Promise<Reservation> {
    const reservation = await this.findById(id);
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
    return await this.update(updated);
  }

  async cancelReservation(id: string | number): Promise<Reservation> {
    const reservation = await this.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const timeSlot = await this.timeSlotRepository.findByTime(reservation.reservationTime);
    if (timeSlot) {
      const releasedSlot = timeSlot.release(reservation.partySize);
      await this.timeSlotRepository.update(releasedSlot);
    }

    const cancelled = reservation.cancel();
    return await this.update(cancelled);
  }

  async getAvailableTimeSlots(): Promise<TimeSlot[]> {
    return await this.timeSlotRepository.findAvailableSlots();
  }

  async delete(id: string | number): Promise<boolean> {
    const result = await ReservationModel.destroy({
      where: { id },
    });

    return result > 0;
  }
}
