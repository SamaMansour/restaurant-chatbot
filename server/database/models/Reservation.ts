/* eslint-disable @typescript-eslint/no-empty-object-type */
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReservationAttributes {
  id: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  status: string;
  conversationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReservationCreationAttributes extends Optional<ReservationAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Reservation extends Model<ReservationAttributes, ReservationCreationAttributes> implements ReservationAttributes {
  declare id: string;
  declare guestName: string;
  declare guestPhone: string;
  declare partySize: number;
  declare reservationDate: Date;
  declare reservationTime: string;
  declare status: string;
  declare conversationId?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Reservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    guestName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'guest_name',
    },
    guestPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'guest_phone',
    },
    partySize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'party_size',
    },
    reservationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'reservation_date',
    },
    reservationTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'reservation_time',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'confirmed',
    },
    conversationId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'conversation_id',
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
    tableName: 'reservations',
    timestamps: true,
    underscored: true,
  }
);

export default Reservation;
