import { ReservationAdapter } from '../../interfaces/reservationAdapter';
import { Conversation } from '../../types';
import { ConversationRepository } from '../../repositories/ConversationRepository';
import { ReservationRepository } from '../../repositories/ReservationRepository';
import { CancelReservationUseCase } from '../../usecases/CancelReservationUseCase';

export class CancelReservationHandler {
  constructor(
    private conversationRepository: ConversationRepository,
    private reservationRepository: ReservationRepository,
    private cancelReservationUseCase: CancelReservationUseCase
  ) {}

  async handleLookup(conversation: Conversation, userInput: string): Promise<string> {
    const phone = userInput.trim();

    try {
      const domainReservations = await this.reservationRepository.findByPhone(phone);
      const reservations = ReservationAdapter.toTypeBatch(domainReservations);

      if (reservations.length === 0) {
        return `No reservations found for ${phone}.
Please check your number and try again, or type 'menu' to return to the main menu:`;
      }

      const context = { ...conversation.context, guest_phone: phone };

      if (reservations.length === 1) {
        const res = reservations[0];
        context.reservation_id = res.id;
        context.previous_reservation = res;

        await this.conversationRepository.updateState(conversation.session_id, 'cancel_confirm', context);

        return `Found your reservation:
Date: ${res.reservation_date}
Time: ${res.reservation_time}
Party Size: ${res.party_size}

Are you sure you want to cancel this reservation? (yes/no):`;
      }

      const list = reservations
        .map((r, i) => `${i + 1}. ${r.reservation_date} at ${r.reservation_time} (Party of ${r.party_size})`)
        .join('\n');

      context.previous_reservation = reservations[0];
      await this.conversationRepository.updateState(conversation.session_id, 'cancel_confirm', context);

      return `Found multiple reservations:\n\n${list}\n\nEnter the number of the reservation you want to cancel:`;
    } catch {
      return 'Error looking up your reservation. Please try again:';
    }
  }

  async handleConfirm(conversation: Conversation, userInput: string): Promise<string> {
    const response = userInput.trim().toLowerCase();

    if (response === 'yes' || response === 'y') {
      try {
        await this.cancelReservationUseCase.execute(conversation.context.previous_reservation?.id!);
        await this.conversationRepository.updateState(conversation.session_id, 'completed', conversation.context);

        return `Reservation cancelled successfully.
We hope to serve you again in the future.

Type 'restart' to make a new reservation.`;
      } catch (error: any) {
        return `Error cancelling reservation: ${error.message || 'Please try again.'}
Type 'menu' to return to the main menu.`;
      }
    }

    if (response === 'no' || response === 'n') {
      await this.conversationRepository.updateState(conversation.session_id, 'menu', {});
      return `Cancellation aborted. Returning to main menu.
1. Make a new reservation
2. Modify an existing reservation
3. Cancel a reservation
Enter a number (1, 2, or 3):`;
    }

    return 'Please answer "yes" or "no":';
  }
}
