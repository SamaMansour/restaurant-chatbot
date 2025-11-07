import { ConversationService } from "../../services/conversationService";
import { ReservationService } from "../../services/reservationService";
import { Conversation } from "../../types";

export class NewReservationHandler {
  constructor(
    private conversationService: ConversationService,
    private reservationService: ReservationService
  ) { }


  public async enterName(conversation: Conversation, userInput: string): Promise<string> {

    const name = userInput.trim();

    if (!name) {
      return 'Please enter a valid name'
    }

    const context = { ...conversation.context, guest_name: name };
    await this.conversationService.updateConversation(
      conversation.session_id,
      'new_reservation_phone',
      context
    );

    return `Now, Plaese enter your phone number`;

  }

  async enterPhone(conversation: Conversation, userInput: string): Promise<string> {
    const phone = userInput.trim();
    const validPhone = /^[\d\s\-\+\(\)]+$/;

    if (!phone || phone.length < 10 || !validPhone.test(phone)) {
      return 'Please enter a valid phone number (at least 10 digits):';
    }

    const context = { ...conversation.context, guest_phone: phone };
    await this.conversationService.updateConversation(
      conversation.session_id,
      'new_reservation_party_size',
      context
    );

    return `Please enter how many guests do you have (1-8)?`


  }


  async handleNumberOfGuests(conversation: Conversation, userInput: string): Promise<string> {
    const numberOfGuests = parseInt(userInput.trim());

    if (isNaN(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > 5) {
      return 'Please enter a valid number of guests (1-20):';
    }

    const context = { ...conversation.context, party_size: numberOfGuests };
    await this.conversationService.updateConversation(
      conversation.session_id,
      'new_reservation_date',
      context
    );

    return `
Please enter your preferred date (YYYY-MM-DD format, e.g., 2025-11-15):`;
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
        'new_reservation_time',
        context
      );

      const slotsList = availableSlots.map((slot, index) => `${index + 1}. ${slot}`).join('\n');

      return `Available time slots for ${dateInput}:

${slotsList}

Please enter the number of your preferred time slot:`;
    } catch (error) {
      return `Error checking availability. Please try again or choose another date:`;
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
        'new_reservation_confirm',
        context
      );

      return `Perfect! Here's your reservation summary:

Name: ${context.guest_name}
Phone: ${context.guest_phone}
Party Size: ${context.party_size}
Date: ${context.reservation_date}
Time: ${context.reservation_time}

Please confirm (yes/no):`;
    } catch (error) {
      return 'Error processing your selection. Please try again:';
    }
  }


    async handleConfirm(conversation: Conversation, userInput: string): Promise<string> {
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

        return `✅ Reservation confirmed!

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