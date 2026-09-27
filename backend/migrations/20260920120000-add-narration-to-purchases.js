'use strict'

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('purchases', 'narration', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('purchases', 'narration')
  },
}