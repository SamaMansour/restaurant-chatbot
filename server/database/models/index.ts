import sequelize from '../config/database';

import Conversation from './Conversation';
import Reservation from './Reservation';

const models = {
  Conversation,
  Reservation,
  sequelize,
};

export { Conversation, Reservation,  sequelize };
export default models;
