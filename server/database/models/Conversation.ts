import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ConversationAttributes {
  id: string;
  sessionId: string;
  state: string;
  context: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'state' | 'context' | 'createdAt' | 'updatedAt'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public sessionId!: string;
  public state!: string;
  public context!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'session_id',
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'greeting',
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    underscored: true,
  }
);

export default Conversation;
