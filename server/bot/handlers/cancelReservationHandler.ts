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
        return `No confirmed reservations found for ${phone}.

Please check your phone number and try again, or type 'menu' to return to main menu:`;
      }

      const context = { ...conversation.context, guest_phone: phone };

      if (reservations.length === 1) {
        context.reservation_id = reservations[0].id;
        context.previous_reservation = reservations[0];

        await this.conversationRepository.updateState(
          conversation.session_id,
          'cancel_confirm',
          context
        );

        return `Found your reservation:

Date: ${reservations[0].reservation_date}
Time: ${reservations[0].reservation_time}
Party Size: ${reservations[0].party_size}

Are you sure you want to cancel this reservation? (yes/no):`;
      } else {
        const resList = reservations
          .map(
            (res, index) =>
              `${index + 1}. ${res.reservation_date} at ${res.reservation_time} (Party of ${res.party_size})`
          )
          .join('\n');

        context.previous_reservation = reservations[0];

        await this.conversationRepository.updateState(
          conversation.session_id,
          'cancel_confirm',
          context
        );

        return `Found multiple reservations:

${resList}

Please enter the number of the reservation you'd like to cancel:`;
      }
    } catch (error) {
      return `Error looking up reservation. Please try again:`;
    }
  }

  async handleConfirm(conversation: Conversation, userInput: string): Promise<string> {
    const response = userInput.trim().toLowerCase();

    if (response === 'yes' || response === 'y') {
      try {
        await this.cancelReservationUseCase.execute(
          conversation.context.previous_reservation?.id!
        );

        await this.conversationRepository.updateState(
          conversation.session_id,
          'completed',
          conversation.context
        );

        return `✅ Reservation cancelled successfully.

We're sorry to see you go. We hope to serve you another time!

Type 'restart' to make a new reservation.`;
      } catch (error: any) {
        return `Sorry, ${error.message || 'there was an error cancelling your reservation'}.

Type 'menu' to return to main menu.`;
      }
    } else if (response === 'no' || response === 'n') {
      await this.conversationRepository.updateState(
        conversation.session_id,
        'menu',
        {}
      );

      return `Cancellation aborted. Returning to main menu...

Please choose an option:
1. Make a new reservation
2. Modify an existing reservation
3. Cancel a reservation

Enter the number (1, 2, or 3):`;
    } else {
      return 'Please answer "yes" or "no":';
    }
  }
}
