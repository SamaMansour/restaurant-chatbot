import { Reservation } from '../domain/Reservation';
import ReservationModel from '../database/models/Reservation';

export class ReservationMapper {
  static toDomain(model: InstanceType<typeof ReservationModel>): Reservation {
    return new Reservation(
      model.id as any,
      model.guestName,
      model.guestPhone,
      model.partySize,
      new Date(model.reservationDate),
      model.reservationTime,
      model.status as 'pending' | 'confirmed' | 'cancelled',
      new Date(model.createdAt),
      new Date(model.updatedAt)
    );
  }

  static toPersistence(domain: Reservation): Record<string, any> {
    return {
      id: domain.id,
      guestName: domain.guestName,
      guestPhone: domain.phoneNumber,
      partySize: domain.partySize,
      reservationDate: domain.reservationDate.toISOString().split('T')[0],
      reservationTime: domain.reservationTime,
      status: domain.status,
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
