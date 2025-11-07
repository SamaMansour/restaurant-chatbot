'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      guest_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      guest_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      party_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reservation_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      reservation_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'confirmed',
      },
      conversation_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

     await queryInterface.addIndex('reservations', ['reservation_date', 'reservation_time'], {
      name: 'idx_reservations_date_time',
    });

    await queryInterface.addIndex('reservations', ['status'], {
      name: 'idx_reservations_status',
    });

    await queryInterface.addIndex('reservations', ['guest_phone'], {
      name: 'idx_reservations_phone',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reservations');
    await queryInterface.removeIndex('reservations', 'idx_reservations_date_time');
    await queryInterface.removeIndex('reservations', 'idx_reservations_status');
    await queryInterface.removeIndex('reservations', 'idx_reservations_phone');
  }
};
