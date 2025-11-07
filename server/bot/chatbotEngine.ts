import { ConversationService } from '../services/conversationService';
import { Conversation, ConversationState, ConversationContext, Reservation } from '../types';

export class ChatbotEngine {
  private conversationService: ConversationService;

  constructor() {
    this.conversationService = new ConversationService();
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
    const context = conversation.context;

        return this.handleGreeting(conversation);

     
  }


  private async handleGreeting(conversation: Conversation): Promise<string> {
    await this.conversationService.updateConversation(
      conversation.session_id,
      'menu',
      conversation.context
    );

    return `Welcome to Restaurant Reservation Bot! 


Please choose an option:
1. Make a new reservation
2. Modify an existing reservation
3. Cancel a reservation

Enter the number (1, 2, or 3):`;
  }


 
}
