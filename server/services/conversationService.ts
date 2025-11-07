import { Conversation as ConversationModel } from '../database/models';
import { Conversation, ConversationState, ConversationContext } from '../types';

export class ConversationService {
     async createConversation(sessionId: string): Promise<Conversation> {
    const created = await ConversationModel.create({
      sessionId,
      state: 'greeting',
      context: {},
    });

    return this.mapToConversation(created);
  }

  async getConversation(sessionId: string): Promise<Conversation | null> {
    const conversation = await ConversationModel.findOne({
      where: { sessionId },
    });

    return conversation ? this.mapToConversation(conversation) : null;
  }

  private mapToConversation(model: any): Conversation {
    return {
      id: model.id,
      session_id: model.sessionId,
      state: model.state,
      context: model.context,
      created_at: model.createdAt?.toISOString(),
      updated_at: model.updatedAt?.toISOString(),
    };
  }
  
}
