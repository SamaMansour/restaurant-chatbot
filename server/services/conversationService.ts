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

  async updateConversation(
    sessionId: string,
    state: ConversationState,
    context: ConversationContext
  ): Promise<Conversation> {
    await ConversationModel.update(
      { state, context },
      { where: { sessionId } }
    );

    const updated = await ConversationModel.findOne({
      where: { sessionId },
    });

    if (!updated) throw new Error('Failed to update conversation');

    return this.mapToConversation(updated);
  }

  async deleteConversation(sessionId: string): Promise<void> {
    await ConversationModel.destroy({
      where: { sessionId },
    });
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
