'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dbName = 'restaurant_bot';

    try {
      await queryInterface.sequelize.query(`CREATE DATABASE ${dbName};`);
      console.log(`Database '${dbName}' created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Database '${dbName}' already exists, skipping creation`);
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const dbName = 'restaurant_bot';
    await queryInterface.sequelize.query(`DROP DATABASE IF EXISTS ${dbName};`);
  }
};
