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

    const response = 'hello';

    return response;
  }

 
}
