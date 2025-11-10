import { Conversation } from '../../types';
import { ConversationRepository } from '../../repositories/ConversationRepository';
import { TimeSlotRepository } from '../../repositories/TimeSlotRepository';
import { CreateReservationUseCase } from '../../usecases/CreateReservationUseCase';

export class NewReservationHandler {
  constructor(
    private conversationRepository: ConversationRepository,
    private timeSlotRepository: TimeSlotRepository,
    private createReservationUseCase: CreateReservationUseCase
  ) {}

  async handleName(conversation: Conversation, userInput: string): Promise<string> {
    const name = userInput.trim();
    if (!name || name.length < 2) {
      return 'Please enter a valid name (at least 2 characters):';
    }

    const context = { ...conversation.context, guest_name: name };
    await this.conversationRepository.updateState(conversation.session_id, 'new_reservation_phone', context);
    return `Thank you, ${name}. Please enter your phone number:`;
  }

  async handlePhone(conversation: Conversation, userInput: string): Promise<string> {
    const phone = userInput.trim();
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;

    if (!phone || phone.length < 10 || !phoneRegex.test(phone)) {
      return 'Please enter a valid phone number (at least 10 digits):';
    }

    const context = { ...conversation.context, guest_phone: phone };
    await this.conversationRepository.updateState(conversation.session_id, 'new_reservation_party_size', context);
    return 'How many guests will be dining with us? (1-20):';
  }

  async handlePartySize(conversation: Conversation, userInput: string): Promise<string> {
    const partySize = parseInt(userInput.trim(), 10);
    if (isNaN(partySize) || partySize < 1 || partySize > 20) {
      return 'Please enter a valid number of guests (1-20):';
    }

    const context = { ...conversation.context, party_size: partySize };
    await this.conversationRepository.updateState(conversation.session_id, 'new_reservation_date', context);
    return `Party of ${partySize}. Please enter your preferred date (YYYY-MM-DD):`;
  }

  async handleDate(conversation: Conversation, userInput: string): Promise<string> {
    const dateInput = userInput.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return 'Please enter a valid date in YYYY-MM-DD format:';
    }

    const date = new Date(dateInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime()) || date < today) {
      return 'Please enter a future date:';
    }

    try {
      const slots = await this.timeSlotRepository.findAvailableSlots();
      if (slots.length === 0) {
        return `No available time slots for ${dateInput}. Please choose another date:`;
      }

      const slotList = slots.map((s, i) => `${i + 1}. ${s.time}`).join('\n');
      const context = { ...conversation.context, reservation_date: dateInput };
      await this.conversationRepository.updateState(conversation.session_id, 'new_reservation_time', context);

      return `Available time slots for ${dateInput}:\n\n${slotList}\n\nEnter the number of your preferred slot:`;
    } catch {
      return 'Error fetching available slots. Please try again:';
    }
  }

  async handleTime(conversation: Conversation, userInput: string): Promise<string> {
    const choice = parseInt(userInput.trim(), 10);
    const slots = await this.timeSlotRepository.findAvailableSlots();
    const slotTimes = slots.map(s => s.time);

    if (isNaN(choice) || choice < 1 || choice > slotTimes.length) {
      return `Please enter a valid number (1-${slotTimes.length}):`;
    }

    const selectedTime = slotTimes[choice - 1];
    const context = { ...conversation.context, reservation_time: selectedTime };
    await this.conversationRepository.updateState(conversation.session_id, 'new_reservation_confirm', context);

    return `Here’s your reservation summary:\n\nName: ${context.guest_name}\nPhone: ${context.guest_phone}\nParty Size: ${context.party_size}\nDate: ${context.reservation_date}\nTime: ${context.reservation_time}\n\nPlease confirm (yes/no):`;
  }

  async handleConfirm(conversation: Conversation, userInput: string): Promise<string> {
    const response = userInput.trim().toLowerCase();

    if (response === 'yes' || response === 'y') {
      try {
        const reservation = await this.createReservationUseCase.execute(
          conversation.context.guest_name!,
          conversation.context.guest_phone!,
          conversation.context.party_size!,
          new Date(conversation.context.reservation_date!),
          conversation.context.reservation_time!
        );

        await this.conversationRepository.updateState(conversation.session_id, 'completed', conversation.context);

        return `Reservation confirmed.\n\nID: ${reservation.id}\nName: ${reservation.guestName}\nDate: ${reservation.reservationDate.toISOString().split('T')[0]}\nTime: ${reservation.reservationTime}\nParty Size: ${reservation.partySize}\n\nType 'restart' to make another reservation.`;
      } catch (error: any) {
        await this.conversationRepository.updateState(conversation.session_id, 'new_reservation_date', conversation.context);
        return `Error creating reservation: ${error.message || 'Please try again.'}`;
      }
    }

    if (response === 'no' || response === 'n') {
      await this.conversationRepository.updateState(conversation.session_id, 'menu', {});
      return 'Reservation cancelled. Returning to main menu.\n\n1. Make a new reservation\n2. Modify an existing reservation\n3. Cancel a reservation\nEnter the number (1, 2, or 3):';
    }

    return 'Please answer "yes" or "no":';
  }
}
