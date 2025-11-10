import { Conversation as DomainConversation } from '../domain/Conversation';
import { Conversation as TypeConversation } from '../types';

export class ConversationAdapter {
  static toType(domain: DomainConversation): TypeConversation {
    return {
      id: domain.id,
      session_id: domain.sessionId,
      state: domain.state,
      context: domain.context,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt.toISOString(),
    };
  }
}
