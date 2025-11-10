import { ReservationAdapter } from '../../interfaces/reservationAdapter';
import { Conversation, Reservation } from '../../types';
import { ConversationRepository } from '../../repositories/ConversationRepository';
import { ReservationRepository } from '../../repositories/ReservationRepository';
import { TimeSlotRepository } from '../../repositories/TimeSlotRepository';
import { UpdateReservationUseCase } from '../../usecases/UpdateReservationUseCase';

export class ModifyReservationHandler {
  constructor(
    private conversationRepository: ConversationRepository,
    private reservationRepository: ReservationRepository,
    private timeSlotRepository: TimeSlotRepository,
    private updateReservationUseCase: UpdateReservationUseCase
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

        await this.conversationRepository.updateState(conversation.session_id, 'modify_menu', context);

        return `Found your reservation:
Date: ${res.reservation_date}
Time: ${res.reservation_time}
Party Size: ${res.party_size}

What would you like to modify?
1. Date and Time
2. Party Size
Enter 1 or 2:`;
      }

      const list = reservations
        .map((r, i) => `${i + 1}. ${r.reservation_date} at ${r.reservation_time} (Party of ${r.party_size})`)
        .join('\n');

      context.previous_reservation = reservations[0];
      await this.conversationRepository.updateState(conversation.session_id, 'modify_menu', context);

      return `Found multiple reservations:\n\n${list}\n\nEnter the number of the reservation you'd like to modify:`;
    } catch {
      return 'Error looking up your reservation. Please try again:';
    }
  }

  async handleMenu(conversation: Conversation, userInput: string): Promise<string> {
    const choice = userInput.trim();

    if (choice === '1') {
      await this.conversationRepository.updateState(conversation.session_id, 'modify_date', conversation.context);
      return 'Please enter your new preferred date (YYYY-MM-DD):';
    }

    if (choice === '2') {
      await this.conversationRepository.updateState(conversation.session_id, 'modify_party_size', conversation.context);
      return 'Please enter the new party size (1-20):';
    }

    return 'Invalid choice. Please enter 1 or 2:';
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
      if (!slots.length) {
        return `No time slots available for ${dateInput}. Please choose another date:`;
      }

      const list = slots.map((s, i) => `${i + 1}. ${s.time}`).join('\n');
      const context = { ...conversation.context, reservation_date: dateInput };
      await this.conversationRepository.updateState(conversation.session_id, 'modify_time', context);

      return `Available time slots for ${dateInput}:\n\n${list}\n\nEnter the number of your preferred slot:`;
    } catch {
      return 'Error checking availability. Please try again:';
    }
  }

  async handleTime(conversation: Conversation, userInput: string): Promise<string> {
    const choice = parseInt(userInput.trim(), 10);

    try {
      const slots = await this.timeSlotRepository.findAvailableSlots();
      const slotTimes = slots.map(s => s.time);

      if (isNaN(choice) || choice < 1 || choice > slotTimes.length) {
        return `Please enter a valid number (1-${slotTimes.length}):`;
      }

      const selectedTime = slotTimes[choice - 1];
      const context = { ...conversation.context, reservation_time: selectedTime };
      await this.conversationRepository.updateState(conversation.session_id, 'modify_confirm', context);

      return `Updated reservation summary:
Previous: ${context.previous_reservation?.reservation_date} at ${context.previous_reservation?.reservation_time}
New: ${context.reservation_date} at ${context.reservation_time}
Party Size: ${context.previous_reservation?.party_size}

Please confirm the changes (yes/no):`;
    } catch {
      return 'Error processing your selection. Please try again:';
    }
  }

  async handlePartySize(conversation: Conversation, userInput: string): Promise<string> {
    const partySize = parseInt(userInput.trim(), 10);
    if (isNaN(partySize) || partySize < 1 || partySize > 20) {
      return 'Please enter a valid number of guests (1-20):';
    }

    const context = { ...conversation.context, party_size: partySize };
    await this.conversationRepository.updateState(conversation.session_id, 'modify_confirm', context);

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
        const newPartySize = conversation.context.party_size;
        const newDate = conversation.context.reservation_date
          ? new Date(conversation.context.reservation_date)
          : undefined;
        const newTime = conversation.context.reservation_time;

        const domainUpdated = await this.updateReservationUseCase.execute(
          conversation.context.previous_reservation?.id!,
          newPartySize,
          newDate,
          newTime
        );

        const updated = ReservationAdapter.toType(domainUpdated);
        await this.conversationRepository.updateState(conversation.session_id, 'completed', conversation.context);

        return `Reservation updated successfully.
ID: ${updated.id}
Date: ${updated.reservation_date}
Time: ${updated.reservation_time}
Party Size: ${updated.party_size}

Type 'restart' to make another reservation.`;
      } catch (error: any) {
        return `Error updating reservation: ${error.message || 'Please try again.'}
Type 'menu' to return to the main menu.`;
      }
    }

    if (response === 'no' || response === 'n') {
      await this.conversationRepository.updateState(conversation.session_id, 'menu', {});
      return `Changes cancelled. Returning to main menu.
1. Make a new reservation
2. Modify an existing reservation
3. Cancel a reservation
Enter a number (1, 2, or 3):`;
    }

    return 'Please answer "yes" or "no":';
  }
}
