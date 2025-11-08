import { ConversationService } from '../services/conversationService';
import { ReservationService } from '../services/reservationService';
import { Conversation } from '../types';
import { GreetingHandler } from './handlers/greetingHandler';
import { MenuHandler } from './handlers/menuHandler';
import { NewReservationHandler } from './handlers/newReservationHandler';
import { CancelReservationHandler } from './handlers/cancelReservationHandler';

export class ChatbotEngine {
  private conversationService: ConversationService;
  private reservationService: ReservationService;
  private greetingHandler: GreetingHandler;
  private menuHandler: MenuHandler;
  private newReservationHandler: NewReservationHandler;
  private cancelReservationHandler: CancelReservationHandler;

  constructor() {
    this.conversationService = new ConversationService();
    this.reservationService = new ReservationService();
    this.greetingHandler = new GreetingHandler(this.conversationService);
    this.menuHandler = new MenuHandler(this.conversationService);
    this.newReservationHandler = new NewReservationHandler(
      this.conversationService,
      this.reservationService
    );
    this.cancelReservationHandler = new CancelReservationHandler(
      this.conversationService,
      this.reservationService
    );
  }

  async processMessage(sessionId: string, userInput: string): Promise<string> {
    let conversation = await this.conversationService.getConversation(sessionId);

    if (!conversation) {
      conversation = await this.conversationService.createConversation(sessionId);
    }

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
        return this.newReservationHandler.enterName(conversation, userInput);

      case 'new_reservation_phone':
        return this.newReservationHandler.enterPhone(conversation, userInput);

      case 'new_reservation_party_size':
        return this.newReservationHandler.handleNumberOfGuests(conversation, userInput);

      case 'new_reservation_date':
        return this.newReservationHandler.handleDate(conversation, userInput);

      case 'new_reservation_time':
        return this.newReservationHandler.handleTime(conversation, userInput);

      case 'new_reservation_confirm':
        return this.newReservationHandler.handleConfirm(conversation, userInput);

    
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
    await this.conversationService.updateConversation(
      conversation.session_id,
      'greeting',
      {}
    );

    return this.greetingHandler.handle(conversation);
  }
}
