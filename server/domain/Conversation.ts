/* eslint-disable @typescript-eslint/no-explicit-any */
export type ConversationState =
  | 'greeting'
  | 'menu'
  | 'new_reservation_name'
  | 'new_reservation_phone'
  | 'new_reservation_party_size'
  | 'new_reservation_date'
  | 'new_reservation_time'
  | 'new_reservation_confirm'
  | 'modify_lookup'
  | 'modify_menu'
  | 'modify_date'
  | 'modify_time'
  | 'modify_party_size'
  | 'modify_confirm'
  | 'cancel_lookup'
  | 'cancel_confirm'
  | 'completed';

export class Conversation {
  constructor(
    public readonly id: string | number,
    public readonly sessionId: string,
    public readonly state: ConversationState,
    public readonly context: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  updateState(newState: ConversationState, newContext?: Record<string, any>): Conversation {
    return new Conversation(
      this.id,
      this.sessionId,
      newState,
      newContext ?? this.context,
      this.createdAt,
      new Date()
    );
  }

  updateContext(updates: Record<string, any>): Conversation {
    return new Conversation(
      this.id,
      this.sessionId,
      this.state,
      { ...this.context, ...updates },
      this.createdAt,
      new Date()
    );
  }

  getContextValue<T>(key: string): T | undefined {
    return this.context[key] as T | undefined;
  }

  hasContextValue(key: string): boolean {
    return key in this.context && this.context[key] !== undefined;
  }
}
