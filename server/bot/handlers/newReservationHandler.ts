/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConversationService } from "../../services/conversationService";
import { ReservationService } from "../../services/reservationService";
import { Conversation } from "../../types";

export class NewReservationHandler {
  constructor(
    private conversationService: ConversationService,
    private reservationService: ReservationService
  ) {}

  async enterName(convo: Conversation, input: string): Promise<string> {
    const name = input.trim();
    if (!name) return "Please enter a valid name.";

    await this.conversationService.updateConversation(convo.session_id, "new_reservation_phone", {
      ...convo.context,
      guest_name: name,
    });

    return "Got it. Please enter your phone number:";
  }

  async enterPhone(convo: Conversation, input: string): Promise<string> {
    const phone = input.trim();
    const isValid = /^[\d\s\-+()]+$/.test(phone) && phone.length >= 10;
    if (!isValid) return "Please enter a valid phone number (at least 10 digits).";

    await this.conversationService.updateConversation(convo.session_id, "new_reservation_party_size", {
      ...convo.context,
      guest_phone: phone,
    });

    return "How many guests (1–8)?";
  }

  async enterPartySize(convo: Conversation, input: string): Promise<string> {
    const size = Number(input.trim());
    if (isNaN(size) || size < 1 || size > 8) return "Please enter a number between 1 and 8.";

    await this.conversationService.updateConversation(convo.session_id, "new_reservation_date", {
      ...convo.context,
      party_size: size,
    });

    return "Please enter the date (YYYY-MM-DD):";
  }

  async enterDate(convo: Conversation, input: string): Promise<string> {
    const date = input.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Invalid format. Example: 2025-11-15";

    const chosen = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(chosen.getTime()) || chosen < today) return "Please enter a future date.";

    const slots = await this.reservationService.getAvailableTimeSlots(date);
    if (!slots.length) return `No time slots available for ${date}. Please choose another date.`;

    await this.conversationService.updateConversation(convo.session_id, "new_reservation_time", {
      ...convo.context,
      reservation_date: date,
    });

    const options = slots.map((s, i) => `${i + 1}. ${s}`).join("\n");
    return `Available time slots for ${date}:\n\n${options}\n\nEnter the number of your preferred slot:`;
  }

  async enterTime(convo: Conversation, input: string): Promise<string> {
    const index = Number(input.trim());
    const slots = await this.reservationService.getAvailableTimeSlots(convo.context.reservation_date!);

    if (isNaN(index) || index < 1 || index > slots.length)
      return `Please enter a number between 1 and ${slots.length}.`;

    const selected = slots[index - 1];
    const context = { ...convo.context, reservation_time: selected };

    await this.conversationService.updateConversation(convo.session_id, "new_reservation_confirm", context);

    return `Here’s your reservation summary:

Name: ${context.guest_name}
Phone: ${context.guest_phone}
Guests: ${context.party_size}
Date: ${context.reservation_date}
Time: ${context.reservation_time}

Confirm? (yes/no)`;
  }

  async confirm(convo: Conversation, input: string): Promise<string> {
    const answer = input.trim().toLowerCase();

    if (["yes", "y"].includes(answer)) {
      try {
        const reservation = await this.reservationService.createReservation({
          guest_name: convo.context.guest_name!,
          guest_phone: convo.context.guest_phone!,
          party_size: convo.context.party_size!,
          reservation_date: convo.context.reservation_date!,
          reservation_time: convo.context.reservation_time!,
          status: "confirmed",
          conversation_id: convo.session_id,
        });

        await this.conversationService.updateConversation(convo.session_id, "completed", convo.context);

        return `Reservation confirmed!

ID: ${reservation.id}
Name: ${reservation.guest_name}
Date: ${reservation.reservation_date}
Time: ${reservation.reservation_time}
Guests: ${reservation.party_size}

Thank you for choosing our restaurant!
Type 'restart' to make another reservation.`;
      } catch (err: any) {
        await this.conversationService.updateConversation(convo.session_id, "new_reservation_date", convo.context);
        return `Sorry, ${err.message || "an error occurred while creating your reservation"}.
Please choose another date:`;
      }
    }

    if (["no", "n"].includes(answer)) {
      await this.conversationService.updateConversation(convo.session_id, "menu", {});
      return `Reservation cancelled. Returning to main menu:

1. Make a new reservation
2. Modify an existing reservation
3. Cancel a reservation

Enter your choice (1, 2, or 3):`;
    }

    return 'Please respond with "yes" or "no".';
  }
}
