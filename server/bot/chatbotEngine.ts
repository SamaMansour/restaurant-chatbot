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
  private conversationRepository: ConversationRepository;
  private greetingHandler: GreetingHandler;
  private menuHandler: MenuHandler;
  private newReservationHandler: NewReservationHandler;
  private modifyReservationHandler: ModifyReservationHandler;
  private cancelReservationHandler: CancelReservationHandler;

  constructor() {
    this.conversationRepository = new ConversationRepository();
    const reservationRepository = new ReservationRepository();
    const timeSlotRepository = new TimeSlotRepository();

    const createReservationUseCase = new CreateReservationUseCase(reservationRepository, timeSlotRepository);
    const updateReservationUseCase = new UpdateReservationUseCase(reservationRepository, timeSlotRepository);
    const cancelReservationUseCase = new CancelReservationUseCase(reservationRepository, timeSlotRepository);

    this.greetingHandler = new GreetingHandler(this.conversationRepository);
    this.menuHandler = new MenuHandler(this.conversationRepository);
    this.newReservationHandler = new NewReservationHandler(
      this.conversationRepository,
      timeSlotRepository,
      createReservationUseCase
    );
    this.modifyReservationHandler = new ModifyReservationHandler(
      this.conversationRepository,
      reservationRepository,
      timeSlotRepository,
      updateReservationUseCase
    );
    this.cancelReservationHandler = new CancelReservationHandler(
      this.conversationRepository,
      reservationRepository,
      cancelReservationUseCase
    );
  }

  async processMessage(sessionId: string, userInput: string): Promise<string> {
    let domainConversation = await this.conversationRepository.findBySessionId(sessionId);

    if (!domainConversation) {
      domainConversation = await this.conversationRepository.create(sessionId);
    }

    const conversation = ConversationAdapter.toType(domainConversation);
    const response = await this.handleState(conversation, userInput);

    return response;
  }

  private async handleState(conversation: Conversation, userInput: string): Promise<string> {
    const state = conversation.state;

    switch (state) {
      case 'greeting':
        return this.greetingHandler.handle(conversation);

      case 'menu':
        return this.menuHandler.handle(conversation, userInput);

      case 'new_reservation_name':
        return this.newReservationHandler.handleName(conversation, userInput);

      case 'new_reservation_phone':
        return this.newReservationHandler.handlePhone(conversation, userInput);

      case 'new_reservation_party_size':
        return this.newReservationHandler.handlePartySize(conversation, userInput);

      case 'new_reservation_date':
        return this.newReservationHandler.handleDate(conversation, userInput);

      case 'new_reservation_time':
        return this.newReservationHandler.handleTime(conversation, userInput);

      case 'new_reservation_confirm':
        return this.newReservationHandler.handleConfirm(conversation, userInput);

      case 'modify_lookup':
        return this.modifyReservationHandler.handleLookup(conversation, userInput);

      case 'modify_menu':
        return this.modifyReservationHandler.handleMenu(conversation, userInput);

      case 'modify_date':
        return this.modifyReservationHandler.handleDate(conversation, userInput);

      case 'modify_time':
        return this.modifyReservationHandler.handleTime(conversation, userInput);

      case 'modify_party_size':
        return this.modifyReservationHandler.handlePartySize(conversation, userInput);

      case 'modify_confirm':
        return this.modifyReservationHandler.handleConfirm(conversation, userInput);

      case 'cancel_lookup':
        return this.cancelReservationHandler.handleLookup(conversation, userInput);

      case 'cancel_confirm':
        return this.cancelReservationHandler.handleConfirm(conversation, userInput);

      case 'completed':
        return this.handleCompleted(conversation);

      default:
        return 'Something went wrong. Please restart the conversation.';
    }
  }

  private async handleCompleted(conversation: Conversation): Promise<string> {
    await this.conversationRepository.updateState(
      conversation.session_id,
      'greeting',
      {}
    );

    return this.greetingHandler.handle(conversation);
  }
}
