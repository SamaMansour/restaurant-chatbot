export interface Reservation {
  id?: string;
  guest_name: string;
  guest_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: 'confirmed' | 'cancelled' | 'modified';
  created_at?: string;
  updated_at?: string;
  conversation_id?: string;
}
export interface Conversation {
  id?: string;
  session_id: string;
  state: ConversationState;
  context: ConversationContext;
  created_at?: string;
  updated_at?: string;
}

export type ConversationState =
  | 'greeting'
  | 'new_reservation_name'
  | 'new_reservation_phone'
  | 'new_reservation_party_size'
  | 'new_reservation_date'
  | 'new_reservation_time'
  | 'new_reservation_confirm'
 

export interface ConversationContext {
  intent?: 'new' | 'modify' | 'cancel';
  guest_name?: string;
  guest_phone?: string;
  party_size?: number;
  reservation_date?: string;
  reservation_time?: string;
  reservation_id?: string;
  previous_reservation?: Reservation;
}
