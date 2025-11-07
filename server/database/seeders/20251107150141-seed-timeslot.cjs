'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const timeSlots = [
      { slot_time: '11:00 AM', max_capacity: 10 },
      { slot_time: '11:30 AM', max_capacity: 10 },
      { slot_time: '12:00 PM', max_capacity: 15 },
      { slot_time: '12:30 PM', max_capacity: 15 },
      { slot_time: '1:00 PM', max_capacity: 15 },
      { slot_time: '1:30 PM', max_capacity: 10 },
      { slot_time: '2:00 PM', max_capacity: 10 },
      { slot_time: '6:00 PM', max_capacity: 15 },
      { slot_time: '6:30 PM', max_capacity: 15 },
      { slot_time: '7:00 PM', max_capacity: 20 },
      { slot_time: '7:30 PM', max_capacity: 20 },
      { slot_time: '8:00 PM', max_capacity: 15 },
      { slot_time: '8:30 PM', max_capacity: 15 },
      { slot_time: '9:00 PM', max_capacity: 10 },
      { slot_time: '9:30 PM', max_capacity: 10 },
    ];

    const data = timeSlots.map(slot => ({
      id: uuidv4(),
      slot_time: slot.slot_time,
      max_capacity: slot.max_capacity,
      is_active: true,
      created_at: new Date(),
    }));

    await queryInterface.bulkInsert('time_slots', data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('time_slots', null, {});
  }
};
