import { Reservation as DomainReservation } from '../domain/Reservation';
import { Reservation as TypeReservation } from '../types';

export class ReservationAdapter {
  static toType(domain: DomainReservation): TypeReservation {
    return {
      id: domain.id,
      guest_name: domain.guestName,
      guest_phone: domain.phoneNumber,
      party_size: domain.partySize,
      reservation_date: domain.reservationDate.toISOString().split('T')[0],
      reservation_time: domain.reservationTime,
      status: domain.status,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt.toISOString(),
    };
  }

  static toTypeBatch(domains: DomainReservation[]): TypeReservation[] {
    return domains.map(domain => this.toType(domain));
  }

  static toDTO(domain: DomainReservation): any {
    return {
      id: domain.id,
      guestName: domain.guestName,
      guestPhone: domain.phoneNumber,
      partySize: domain.partySize,
      reservationDate: domain.reservationDate.toISOString().split('T')[0],
      reservationTime: domain.reservationTime,
      status: domain.status,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
