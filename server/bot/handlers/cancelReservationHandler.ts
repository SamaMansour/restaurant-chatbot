/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConversationService } from "../../services/conversationService";
import { ReservationService } from "../../services/reservationService";
import { Conversation } from "../../types";

export class CancelReservationHandler {
  constructor(
    private conversationService: ConversationService,
    private reservationService: ReservationService
  ) {}

  async handleLookup(convo: Conversation, input: string): Promise<string> {
    const phone = input.trim();
    if (!phone) return "Please enter a valid phone number.";

    try {
      const reservations = await this.reservationService.getReservationByPhone(phone);
      if (!reservations.length) {
        return `No confirmed reservations found for ${phone}.
Please check your number and try again, or type 'menu' to return to the main menu.`;
      }

      const context = { ...convo.context, guest_phone: phone };

      if (reservations.length === 1) {
        const r = reservations[0];
        await this.conversationService.updateConversation(convo.session_id, "cancel_confirm", {
          ...context,
          reservation_id: r.id,
          previous_reservation: r,
        });

        return `Found your reservation:
Date: ${r.reservation_date}
Time: ${r.reservation_time}
Party Size: ${r.party_size}

Are you sure you want to cancel this reservation? (yes/no)`;
      }

      const list = reservations
        .map((r, i) => `${i + 1}. ${r.reservation_date} at ${r.reservation_time} (Party of ${r.party_size})`)
        .join("\n");

      await this.conversationService.updateConversation(convo.session_id, "cancel_confirm", context);

      return `Found multiple reservations:\n\n${list}\n\nEnter the number of the reservation you'd like to cancel:`;
    } catch {
      return "Error looking up reservations. Please try again.";
    }
  }

  async handleConfirm(convo: Conversation, input: string): Promise<string> {
    const answer = input.trim().toLowerCase();

    if (["yes", "y"].includes(answer)) {
      try {
        const id = convo.context.previous_reservation?.id;
        if (!id) return "No reservation selected. Please start again.";

        await this.reservationService.cancelReservation(id);
        await this.conversationService.updateConversation(convo.session_id, "completed", convo.context);

        return `Reservation cancelled successfully.
We hope to serve you another time!

Type 'restart' to make a new reservation.`;
      } catch (err: any) {
        return `Sorry, ${err.message || "an error occurred while cancelling your reservation"}.
Type 'menu' to return to the main menu.`;
      }
    }

    if (["no", "n"].includes(answer)) {
      await this.conversationService.updateConversation(convo.session_id, "menu", {});
      return `Cancellation aborted. Returning to main menu:

1. Make a new reservation
2. Modify an existing reservation
3. Cancel a reservation

Enter your choice (1, 2, or 3):`;
    }

    return 'Please respond with "yes" or "no".';
  }
}
