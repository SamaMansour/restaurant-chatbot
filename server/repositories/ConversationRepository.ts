import { Conversation, ConversationState } from '../domain/Conversation';
import { ConversationMapper } from '../mappers/ConversationMapper';
import ConversationModel from '../database/models/Conversation';

export class ConversationRepository {
  async create(sessionId: string): Promise<Conversation> {
    const model = await ConversationModel.create({
      sessionId: sessionId,
      state: 'greeting',
      context: {},
    });

    return ConversationMapper.toDomain(model);
  }

  async findBySessionId(sessionId: string): Promise<Conversation | null> {
    const model = await ConversationModel.findOne({
      where: { sessionId: sessionId },
    });

    return model ? ConversationMapper.toDomain(model) : null;
  }

  async update(conversation: Conversation): Promise<Conversation> {
    const model = await ConversationModel.findOne({
      where: { sessionId: conversation.sessionId },
    });

    if (!model) {
      throw new Error(`Conversation with session_id ${conversation.sessionId} not found`);
    }

    const updateData = ConversationMapper.toPersistence(conversation);
    await model.update(updateData);
    await model.reload();

    return ConversationMapper.toDomain(model);
  }

  async updateState(sessionId: string, state: ConversationState, context: Record<string, any>): Promise<Conversation> {
    const conversation = await this.findBySessionId(sessionId);
    if (!conversation) {
      throw new Error(`Conversation with session_id ${sessionId} not found`);
    }

    const updated = conversation.updateState(state, context);
    return await this.update(updated);
  }

  async delete(sessionId: string): Promise<boolean> {
    const result = await ConversationModel.destroy({
      where: { sessionId: sessionId },
    });

    return result > 0;
  }
}
