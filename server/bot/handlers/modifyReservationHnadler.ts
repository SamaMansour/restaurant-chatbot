/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConversationService } from '../../services/conversationService';
import { ReservationService } from '../../services/reservationService';
import { Conversation, Reservation } from '../../types';

export class ModifyReservationHandler {
  constructor(
    private conversationService: ConversationService,
    private reservationService: ReservationService
  ) {}

  async handleLookup(conversation: Conversation, userInput: string): Promise<string> {
    const phone = userInput.trim();

    try {
      const reservations = await this.reservationService.getReservationByPhone(phone);

      if (reservations.length === 0) {
        return `No confirmed reservations found for ${phone}.

Please check your phone number and try again, or type 'menu' to return to main menu:`;
      }

      const context = { ...conversation.context, guest_phone: phone };

      if (reservations.length === 1) {
        context.reservation_id = reservations[0].id;
        context.previous_reservation = reservations[0];

        await this.conversationService.updateConversation(
          conversation.session_id,
          'modify_menu',
          context
        );

        return `Found your reservation:

Date: ${reservations[0].reservation_date}
Time: ${reservations[0].reservation_time}
Party Size: ${reservations[0].party_size}

What would you like to modify?
1. Date and Time
2. Party Size

Enter the number (1 or 2):`;
      } else {
        const resList = reservations
          .map(
            (res, index) =>
              `${index + 1}. ${res.reservation_date} at ${res.reservation_time} (Party of ${res.party_size})`
          )
          .join('\n');

        context.previous_reservation = reservations[0];

        await this.conversationService.updateConversation(
          conversation.session_id,
          'modify_menu',
          context
        );

        return `Found multiple reservations:

${resList}

Please enter the number of the reservation you'd like to modify:`;
      }
    } catch (error) {
      return `Error looking up reservation. Please try again:`;
    }
  }

  async handleMenu(conversation: Conversation, userInput: string): Promise<string> {
    const choice = userInput.trim();

    if (choice === '1') {
      await this.conversationService.updateConversation(
        conversation.session_id,
        'modify_date',
        conversation.context
      );

      return `Please enter your new preferred date (YYYY-MM-DD format):`;
    } else if (choice === '2') {
      await this.conversationService.updateConversation(
        conversation.session_id,
        'modify_party_size',
        conversation.context
      );

      return `Please enter the new party size (1-20):`;
    } else {
      return `Invalid choice. Please enter 1 or 2:`;
    }
  }

  async handleDate(conversation: Conversation, userInput: string): Promise<string> {
    const dateInput = userInput.trim();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(dateInput)) {
      return 'Please enter a valid date in YYYY-MM-DD format (e.g., 2025-11-15):';
    }

    const inputDate = new Date(dateInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(inputDate.getTime()) || inputDate < today) {
      return 'Please enter a valid future date in YYYY-MM-DD format:';
    }

    try {
      const availableSlots = await this.reservationService.getAvailableTimeSlots(dateInput);

      if (availableSlots.length === 0) {
        return `Sorry, no time slots are available for ${dateInput}. Please choose another date:`;
      }

      const context = { ...conversation.context, reservation_date: dateInput };
      await this.conversationService.updateConversation(
        conversation.session_id,
        'modify_time',
        context
      );

      const slotsList = availableSlots.map((slot, index) => `${index + 1}. ${slot}`).join('\n');

      return `Available time slots for ${dateInput}:

${slotsList}

Please enter the number of your preferred time slot:`;
    } catch (error) {
      return `Error checking availability. Please try again:`;
    }
  }

  async handleTime(conversation: Conversation, userInput: string): Promise<string> {
    const choice = parseInt(userInput.trim());

    try {
      const availableSlots = await this.reservationService.getAvailableTimeSlots(
        conversation.context.reservation_date!
      );

      if (isNaN(choice) || choice < 1 || choice > availableSlots.length) {
        return `Please enter a valid number (1-${availableSlots.length}):`;
      }

      const selectedTime = availableSlots[choice - 1];
      const context = { ...conversation.context, reservation_time: selectedTime };
      await this.conversationService.updateConversation(
        conversation.session_id,
        'modify_confirm',
        context
      );

      return `Updated reservation summary:

Previous: ${context.previous_reservation?.reservation_date} at ${context.previous_reservation?.reservation_time}
New: ${context.reservation_date} at ${context.reservation_time}
Party Size: ${context.previous_reservation?.party_size}

Please confirm the changes (yes/no):`;
    } catch (error) {
      return 'Error processing your selection. Please try again:';
    }
  }

  async handlePartySize(conversation: Conversation, userInput: string): Promise<string> {
    const partySize = parseInt(userInput.trim());

    if (isNaN(partySize) || partySize < 1 || partySize > 20) {
      return 'Please enter a valid number of guests (1-20):';
    }

    const context = { ...conversation.context, party_size: partySize };
    await this.conversationService.updateConversation(
      conversation.session_id,
      'modify_confirm',
      context
    );

    return `Updated reservation summary:

Date: ${context.previous_reservation?.reservation_date}
Time: ${context.previous_reservation?.reservation_time}
Previous Party Size: ${context.previous_reservation?.party_size}
New Party Size: ${partySize}

Please confirm the changes (yes/no):`;
  }

  async handleConfirm(conversation: Conversation, userInput: string): Promise<string> {
    const response = userInput.trim().toLowerCase();

    if (response === 'yes' || response === 'y') {
      try {
        const updates: Partial<Reservation> = {};

        if (conversation.context.reservation_date) {
          updates.reservation_date = conversation.context.reservation_date;
          updates.reservation_time = conversation.context.reservation_time;
        }

        if (conversation.context.party_size) {
          updates.party_size = conversation.context.party_size;
        }

        const updated = await this.reservationService.updateReservation(
          conversation.context.previous_reservation?.id!,
          updates
        );

        await this.conversationService.updateConversation(
          conversation.session_id,
          'completed',
          conversation.context
        );

        return `✅ Reservation updated successfully!

Confirmation ID: ${updated.id}
Date: ${updated.reservation_date}
Time: ${updated.reservation_time}
Party Size: ${updated.party_size}

Type 'restart' to make another reservation.`;
      } catch (error: any) {
        return `Sorry, ${error.message || 'there was an error updating your reservation'}.

Type 'menu' to return to main menu.`;
      }
    } else if (response === 'no' || response === 'n') {
      await this.conversationService.updateConversation(
        conversation.session_id,
        'menu',
        {}
      );

      return `Changes cancelled. Returning to main menu...

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
