/* eslint-disable @typescript-eslint/no-explicit-any */
import { Op } from 'sequelize';
import { Reservation as ReservationModel, TimeSlot } from '../database/models';
import { Reservation } from '../types';

export class ReservationService {
  async createReservation(reservation: Omit<Reservation, 'id'>): Promise<Reservation> {
    const isAvailable = await this.checkAvailability(
      reservation.reservation_date,
      reservation.reservation_time
    );

    if (!isAvailable) {
      throw new Error('This time slot is fully booked');
    }

    const created = await ReservationModel.create({
      guestName: reservation.guest_name,
      guestPhone: reservation.guest_phone,
      partySize: reservation.party_size,
      reservationDate: new Date(reservation.reservation_date),
      reservationTime: reservation.reservation_time,
      status: reservation.status || 'confirmed',
      conversationId: reservation.conversation_id,
    });

    return this.mapToReservation(created);
  }

  async getReservationByPhone(phone: string): Promise<Reservation[]> {
    const reservations = await ReservationModel.findAll({
      where: {
        guestPhone: phone,
        status: 'confirmed',
      },
      order: [['reservationDate', 'ASC']],
    });

    return reservations.map(this.mapToReservation);
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    const reservation = await ReservationModel.findByPk(id);
    return reservation ? this.mapToReservation(reservation) : null;
  }

  async updateReservation(
    id: string,
    updates: Partial<Reservation>
  ): Promise<Reservation> {
    if (updates.reservation_date && updates.reservation_time) {
      const isAvailable = await this.checkAvailability(
        updates.reservation_date,
        updates.reservation_time,
        id
      );

      if (!isAvailable) {
        throw new Error('This time slot is fully booked');
      }
    }

    const updateData: any = {
      status: 'modified',
    };

    if (updates.guest_name) updateData.guestName = updates.guest_name;
    if (updates.guest_phone) updateData.guestPhone = updates.guest_phone;
    if (updates.party_size) updateData.partySize = updates.party_size;
    if (updates.reservation_date)
      updateData.reservationDate = new Date(updates.reservation_date);
    if (updates.reservation_time) updateData.reservationTime = updates.reservation_time;

    await ReservationModel.update(updateData, { where: { id } });

    const updated = await ReservationModel.findByPk(id);
    if (!updated) throw new Error('Failed to update reservation');

    return this.mapToReservation(updated);
  }

  async cancelReservation(id: string): Promise<Reservation> {
    await ReservationModel.update({ status: 'cancelled' }, { where: { id } });

    const cancelled = await ReservationModel.findByPk(id);
    if (!cancelled) throw new Error('Failed to cancel reservation');

    return this.mapToReservation(cancelled);
  }

  async getAvailableTimeSlots(date: string): Promise<string[]> {
    const slots = await TimeSlot.findAll({
      where: { isActive: true },
    });

    const reservations = await ReservationModel.findAll({
      where: {
        reservationDate: new Date(date),
        status: 'confirmed',
      },
      attributes: ['reservationTime'],
    });

    const bookedCounts = new Map<string, number>();
    reservations.forEach((res) => {
      const count = bookedCounts.get(res.reservationTime) || 0;
      bookedCounts.set(res.reservationTime, count + 1);
    });

    const availableSlots = slots
      .filter((slot) => {
        const bookedCount = bookedCounts.get(slot.slotTime) || 0;
        return bookedCount < slot.maxCapacity;
      })
      .map((slot) => slot.slotTime);

    return availableSlots;
  }

  private async checkAvailability(
    date: string,
    time: string,
    excludeReservationId?: string
  ): Promise<boolean> {
    const slot = await TimeSlot.findOne({
      where: {
        slotTime: time,
        isActive: true,
      },
    });

    if (!slot) return false;

    const whereCondition: any = {
      reservationDate: new Date(date),
      reservationTime: time,
      status: 'confirmed',
    };

    if (excludeReservationId) {
      whereCondition.id = { [Op.ne]: excludeReservationId };
    }

    const count = await ReservationModel.count({
      where: whereCondition,
    });

    return count < slot.maxCapacity;
  }

  private mapToReservation(model: any): Reservation {
    return {
      id: model.id,
      guest_name: model.guestName,
      guest_phone: model.guestPhone,
      party_size: model.partySize,
      reservation_date: model.reservationDate,
      reservation_time: model.reservationTime,
      status: model.status,
      conversation_id: model.conversationId,
      created_at: model.createdAt?.toISOString(),
      updated_at: model.updatedAt?.toISOString(),
    };
  }
}
