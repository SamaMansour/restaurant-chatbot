import { ConversationService } from '../../services/conversationService';
import { Conversation } from '../../types';

export class GreetingHandler {
  constructor(private conversationService: ConversationService) {}

  async handle(conversation: Conversation): Promise<string> {
    await this.conversationService.updateConversation(
      conversation.session_id,
      'menu',
      conversation.context
    );

    return `Welcome to Restaurant Reservation Bot!

I'm here to help you with your restaurant reservations.

Please choose an option:
1. Make a new reservation
2. Modify an existing reservation
3. Cancel a reservation

Enter the number (1, 2, or 3):`;
  }
}
