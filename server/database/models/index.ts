import sequelize from '../config/database';
import Reservation from './Reservation';
import Conversation from './Conversation';
import TimeSlot from './TimeSlot';

const models = {
  Reservation,
  Conversation,
  TimeSlot,
  sequelize,
};

export default models;
