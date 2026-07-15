'use strict'

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('batches', 'closing_statement', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('batches', 'closing_statement')
  },
}
