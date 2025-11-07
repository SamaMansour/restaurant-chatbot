'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'greeting',
      },
      context: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
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
     await queryInterface.addIndex('conversations', ['session_id'], {
      name: 'idx_conversations_session_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('conversations');
    await queryInterface.removeIndex('conversations', 'idx_conversations_session_id');

  }
};
