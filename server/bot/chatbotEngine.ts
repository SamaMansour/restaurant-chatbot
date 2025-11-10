import { ConversationRepository } from '../repositories/ConversationRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';
import { ConversationAdapter } from '../interfaces/conversationAdapter';
import { Conversation } from '../types';
import { GreetingHandler } from './handlers/greetingHandler';
import { MenuHandler } from './handlers/menuHandler';
import { NewReservationHandler } from './handlers/newReservationHandler';
import { ModifyReservationHandler } from './handlers/modifyReservationHandler';
import { CancelReservationHandler } from './handlers/cancelReservationHandler';
import { CreateReservationUseCase } from '../usecases/CreateReservationUseCase';
import { UpdateReservationUseCase } from '../usecases/UpdateReservationUseCase';
import { CancelReservationUseCase } from '../usecases/CancelReservationUseCase';

export class ChatbotEngine {
  private conversationRepo = new ConversationRepository();
  private greetingHandler: GreetingHandler;
  private menuHandler: MenuHandler;
  private newReservationHandler: NewReservationHandler;
  private modifyHandler: ModifyReservationHandler;
  private cancelHandler: CancelReservationHandler;

  constructor() {
    const reservationRepo = new ReservationRepository();
    const timeSlotRepo = new TimeSlotRepository();

    const createReservation = new CreateReservationUseCase(reservationRepo, timeSlotRepo);
    const updateReservation = new UpdateReservationUseCase(reservationRepo, timeSlotRepo);
    const cancelReservation = new CancelReservationUseCase(reservationRepo, timeSlotRepo);

    this.greetingHandler = new GreetingHandler(this.conversationRepo);
    this.menuHandler = new MenuHandler(this.conversationRepo);
    this.newReservationHandler = new NewReservationHandler(this.conversationRepo, timeSlotRepo, createReservation);
    this.modifyHandler = new ModifyReservationHandler(this.conversationRepo, reservationRepo, timeSlotRepo, updateReservation);
    this.cancelHandler = new CancelReservationHandler(this.conversationRepo, reservationRepo, cancelReservation);
  }

  async processMessage(sessionId: string, userInput: string): Promise<string> {
    let conversation = await this.conversationRepo.findBySessionId(sessionId);
    if (!conversation) conversation = await this.conversationRepo.create(sessionId);

    const conv = ConversationAdapter.toType(conversation);
    return this.routeState(conv, userInput);
  }

  private async routeState(conv: Conversation, input: string): Promise<string> {
    switch (conv.state) {
      case 'greeting': return this.greetingHandler.handle(conv);
      case 'menu': return this.menuHandler.handle(conv, input);

      case 'new_reservation_name': return this.newReservationHandler.handleName(conv, input);
      case 'new_reservation_phone': return this.newReservationHandler.handlePhone(conv, input);
      case 'new_reservation_party_size': return this.newReservationHandler.handlePartySize(conv, input);
      case 'new_reservation_date': return this.newReservationHandler.handleDate(conv, input);
      case 'new_reservation_time': return this.newReservationHandler.handleTime(conv, input);
      case 'new_reservation_confirm': return this.newReservationHandler.handleConfirm(conv, input);

      case 'modify_lookup': return this.modifyHandler.handleLookup(conv, input);
      case 'modify_menu': return this.modifyHandler.handleMenu(conv, input);
      case 'modify_date': return this.modifyHandler.handleDate(conv, input);
      case 'modify_time': return this.modifyHandler.handleTime(conv, input);
      case 'modify_party_size': return this.modifyHandler.handlePartySize(conv, input);
      case 'modify_confirm': return this.modifyHandler.handleConfirm(conv, input);

      case 'cancel_lookup': return this.cancelHandler.handleLookup(conv, input);
      case 'cancel_confirm': return this.cancelHandler.handleConfirm(conv, input);

      case 'completed': return this.resetConversation(conv);
      default: return 'An unexpected error occurred. Please restart the chat.';
    }
  }

  private async resetConversation(conv: Conversation): Promise<string> {
    await this.conversationRepo.updateState(conv.session_id, 'greeting', {});
    return this.greetingHandler.handle(conv);
  }
}
