'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('batch_daily_logs', 'sold_birds', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    })
    await queryInterface.addColumn('batch_daily_logs', 'sold_weight', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('batch_daily_logs', 'sold_weight')
    await queryInterface.removeColumn('batch_daily_logs', 'sold_birds')
  },
}
