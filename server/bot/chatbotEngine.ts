import { ConversationService } from '../services/conversationService';
import { ReservationService } from '../services/reservationService';
import { Conversation } from '../types';
import { GreetingHandler } from './handlers/greetingHandler';
import { NewReservationHandler } from './handlers/newReservationHandler';

export class ChatbotEngine {
  private conversationService: ConversationService;
  private reservationService: ReservationService;
  private greetingHandler: GreetingHandler;
  private newReservationHandler: NewReservationHandler;


  constructor() {
    this.conversationService = new ConversationService();
    this.reservationService = new ReservationService();
    this.greetingHandler = new GreetingHandler(this.conversationService);
    this.newReservationHandler = new NewReservationHandler(
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

      
      default:
        return 'Something went wrong. Please restart the conversation.';
    }
  }

}
