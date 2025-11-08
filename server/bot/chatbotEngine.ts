import { ConversationService } from "../services/conversationService";
import { ReservationService } from "../services/reservationService";
import { Conversation } from "../types";
import { GreetingHandler } from "./handlers/greetingHandler";
import { MenuHandler } from "./handlers/menuHandler";
import { NewReservationHandler } from "./handlers/newReservationHandler";
import { CancelReservationHandler } from "./handlers/cancelReservationHandler";
import { ModifyReservationHandler } from "./handlers/modifyReservationHnadler";

export class ChatbotEngine {
  private conversationService = new ConversationService();
  private reservationService = new ReservationService();
  private greeting = new GreetingHandler(this.conversationService);
  private menu = new MenuHandler(this.conversationService);
  private newReservation = new NewReservationHandler(this.conversationService, this.reservationService);
  private modify = new ModifyReservationHandler(this.conversationService, this.reservationService);
  private cancel = new CancelReservationHandler(this.conversationService, this.reservationService);

  async processMessage(sessionId: string, userInput: string): Promise<string> {
    let convo = await this.conversationService.getConversation(sessionId);
    if (!convo) convo = await this.conversationService.createConversation(sessionId);

    return this.route(convo, userInput);
  }

  private async route(convo: Conversation, input: string): Promise<string> {
    const state = convo.state;

    const map: Record<string, () => Promise<string>> = {
      greeting: () => this.greeting.handle(convo),
      menu: () => this.menu.handle(convo, input),
      new_reservation_name: () => this.newReservation.enterName(convo, input),
      new_reservation_phone: () => this.newReservation.enterPhone(convo, input),
      new_reservation_party_size: () => this.newReservation.enterPartySize(convo, input),
      new_reservation_date: () => this.newReservation.enterDate(convo, input),
      new_reservation_time: () => this.newReservation.enterTime(convo, input),
      new_reservation_confirm: () => this.newReservation.confirm(convo, input),
      modify_lookup: () => this.modify.handleLookup(convo, input),
      modify_menu: () => this.modify.handleMenu(convo, input),
      modify_date: () => this.modify.handleDate(convo, input),
      modify_time: () => this.modify.handleTime(convo, input),
      modify_party_size: () => this.modify.handlePartySize(convo, input),
      modify_confirm: () => this.modify.handleConfirm(convo, input),
      cancel_lookup: () => this.cancel.handleLookup(convo, input),
      cancel_confirm: () => this.cancel.handleConfirm(convo, input),
      completed: () => this.reset(convo),
    };

    return map[state]?.() || "Something went wrong. Please restart.";
  }

  private async reset(convo: Conversation): Promise<string> {
    await this.conversationService.updateConversation(convo.session_id, "greeting", {});
    return this.greeting.handle(convo);
  }
}
