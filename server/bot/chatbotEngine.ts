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
    const { state } = convo;

    switch (state) {
      case "greeting":
        return this.greeting.handle(convo);

      case "menu":
        return this.menu.handle(convo, input);

      case "new_reservation_name":
        return this.newReservation.enterName(convo, input);

      case "new_reservation_phone":
        return this.newReservation.enterPhone(convo, input);

      case "new_reservation_party_size":
        return this.newReservation.enterPartySize(convo, input);

      case "new_reservation_date":
        return this.newReservation.enterDate(convo, input);

      case "new_reservation_time":
        return this.newReservation.enterTime(convo, input);

      case "new_reservation_confirm":
        return this.newReservation.confirm(convo, input);

      case "modify_lookup":
        return this.modify.handleLookup(convo, input);

      case "modify_menu":
        return this.modify.handleMenu(convo, input);

      case "modify_date":
        return this.modify.handleDate(convo, input);

      case "modify_time":
        return this.modify.handleTime(convo, input);

      case "modify_party_size":
        return this.modify.handlePartySize(convo, input);

      case "modify_confirm":
        return this.modify.handleConfirm(convo, input);

      case "cancel_lookup":
        return this.cancel.handleLookup(convo, input);

      case "cancel_confirm":
        return this.cancel.handleConfirm(convo, input);

      case "completed":
        return this.reset(convo);

      default:
        return "Something went wrong. Please restart.";
    }
  }

  private async reset(convo: Conversation): Promise<string> {
    await this.conversationService.updateConversation(convo.session_id, "greeting", {});
    return this.greeting.handle(convo);
  }
}
