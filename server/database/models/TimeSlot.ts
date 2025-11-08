/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TimeSlotAttributes {
  id: string;
  slotTime: string;
  maxCapacity: number;
  isActive: boolean;
  createdAt?: Date;
}

interface TimeSlotCreationAttributes extends Optional<TimeSlotAttributes, 'id' | 'maxCapacity' | 'isActive' | 'createdAt'> {}

class TimeSlot extends Model<TimeSlotAttributes, TimeSlotCreationAttributes> implements TimeSlotAttributes {
  declare id: string;
  declare slotTime: string;
  declare maxCapacity: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
}

TimeSlot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slotTime: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'slot_time',
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: 'max_capacity',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'time_slots',
    timestamps: false,
    underscored: true,
  }
);

export default TimeSlot;
