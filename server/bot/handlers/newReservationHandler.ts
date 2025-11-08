/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConversationService } from "../../services/conversationService";
import { ReservationService } from "../../services/reservationService";
import { Conversation } from "../../types";

export class NewReservationHandler {
  constructor(
    private conversationService: ConversationService,
    private reservationService: ReservationService
  ) {}

  async enterName(conversation: Conversation, input: string): Promise<string> {
    const name = input.trim();
    if (!name) return "Please enter a valid name.";

    await this.conversationService.updateConversation(conversation.session_id, "new_reservation_phone", {
      ...conversation.context,
      guest_name: name,
    });

    return "Got it. Please enter your phone number:";
  }

  async enterPhone(conversation: Conversation, input: string): Promise<string> {
    const phone = input.trim();
    const isValid = /^[\d\s\-\+\(\)]+$/.test(phone);

    if (!isValid || phone.length < 10)
      return "Please enter a valid phone number (at least 10 digits).";

    await this.conversationService.updateConversation(conversation.session_id, "new_reservation_party_size", {
      ...conversation.context,
      guest_phone: phone,
    });

    return "How many guests (1–8)?";
  }

  async enterPartySize(conversation: Conversation, input: string): Promise<string> {
    const count = parseInt(input.trim(), 10);
    if (isNaN(count) || count < 1 || count > 8)
      return "Please enter a valid number between 1 and 8.";

    await this.conversationService.updateConversation(conversation.session_id, "new_reservation_date", {
      ...conversation.context,
      party_size: count,
    });

    return "Please enter the date (YYYY-MM-DD):";
  }

  async enterDate(conversation: Conversation, input: string): Promise<string> {
    const date = input.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Invalid date format. Example: 2025-11-15";

    const parsed = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(parsed.getTime()) || parsed < today)
      return "Please enter a future date.";

    const slots = await this.reservationService.getAvailableTimeSlots(date);
    if (!slots.length) return `No time slots available for ${date}. Choose another date.`;

    await this.conversationService.updateConversation(conversation.session_id, "new_reservation_time", {
      ...conversation.context,
      reservation_date: date,
    });

    const list = slots.map((s, i) => `${i + 1}. ${s}`).join("\n");
    return `Available time slots for ${date}:\n\n${list}\n\nEnter the number of your preferred slot:`;
  }

  async enterTime(conversation: Conversation, input: string): Promise<string> {
    const choice = parseInt(input.trim(), 10);
    const slots = await this.reservationService.getAvailableTimeSlots(conversation.context.reservation_date!);

    if (isNaN(choice) || choice < 1 || choice > slots.length)
      return `Please enter a valid number (1–${slots.length}).`;

    const selected = slots[choice - 1];
    const ctx = { ...conversation.context, reservation_time: selected };

    await this.conversationService.updateConversation(conversation.session_id, "new_reservation_confirm", ctx);

    return `Here’s your reservation summary:

    Name: ${ctx.guest_name}
    Phone: ${ctx.guest_phone}
    Guests: ${ctx.party_size}
    Date: ${ctx.reservation_date}
    Time: ${ctx.reservation_time}

    Confirm? (yes/no)`;
  }

  async confirm(conversation: Conversation, userInput: string): Promise<string> {
    const response = userInput.trim().toLowerCase();

    if (response === 'yes' || response === 'y') {
      try {
        const reservation = await this.reservationService.createReservation({
          guest_name: conversation.context.guest_name!,
          guest_phone: conversation.context.guest_phone!,
          party_size: conversation.context.party_size!,
          reservation_date: conversation.context.reservation_date!,
          reservation_time: conversation.context.reservation_time!,
          status: 'confirmed',
          conversation_id: conversation.session_id,
        });

        await this.conversationService.updateConversation(
          conversation.session_id,
          'completed',
          conversation.context
        );

        return `Reservation confirmed!

Confirmation ID: ${reservation.id}
Name: ${reservation.guest_name}
Date: ${reservation.reservation_date}
Time: ${reservation.reservation_time}
Party Size: ${reservation.party_size}

We look forward to serving you! Thank you for choosing our restaurant.

Type 'restart' to make another reservation.`;
      } catch (error: any) {
        await this.conversationService.updateConversation(
          conversation.session_id,
          'new_reservation_date',
          conversation.context
        );

        return `Sorry, ${error.message || 'there was an error creating your reservation'}.

Please choose another date:`;
      }
    } else if (response === 'no' || response === 'n') {
      await this.conversationService.updateConversation(
        conversation.session_id,
        'menu',
        {}
      );

      return `Reservation cancelled. Returning to main menu...

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
