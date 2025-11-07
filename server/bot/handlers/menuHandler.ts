import { ConversationService } from '../../services/conversationService';
import { Conversation } from '../../types';

export class MenuHandler {
  constructor(private conversationService: ConversationService) {}

  async handle(conversation: Conversation, userInput: string): Promise<string> {
    const choice = userInput.trim();

    if (choice === '1') {
      await this.conversationService.updateConversation(
        conversation.session_id,
        'new_reservation_name',
        { intent: 'new' }
      );
      return `Great! Let's make a new reservation.

Please enter your name:`;
    } else if (choice === '2') {
      await this.conversationService.updateConversation(
        conversation.session_id,
        'modify_lookup',
        { intent: 'modify' }
      );
      return `I'll help you modify your reservation.

Please enter the phone number associated with your reservation:`;
    } else if (choice === '3') {
      await this.conversationService.updateConversation(
        conversation.session_id,
        'cancel_lookup',
        { intent: 'cancel' }
      );
      return `I'll help you cancel your reservation.

Please enter the phone number associated with your reservation:`;
    } else {
      return `Invalid choice. Please enter 1, 2, or 3.`;
    }
  }
}
