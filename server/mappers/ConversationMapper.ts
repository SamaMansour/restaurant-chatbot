import { Conversation, ConversationState } from '../domain/Conversation';
import ConversationModel from '../database/models/Conversation';

export class ConversationMapper {
  static toDomain(model: InstanceType<typeof ConversationModel>): Conversation {
    return new Conversation(
      model.id as any,
      model.sessionId,
      model.state as ConversationState,
      model.context,
      new Date(model.createdAt),
      new Date(model.updatedAt)
    );
  }

  static toPersistence(domain: Conversation): Record<string, any> {
    return {
      id: domain.id,
      sessionId: domain.sessionId,
      state: domain.state,
      context: domain.context,
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
