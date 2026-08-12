'use strict'

const COLUMNS = ['state', 'district', 'place', 'pincode', 'bird', 'capacity']

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      for (const column of COLUMNS) {
        await queryInterface.addColumn(
          'users',
          column,
          {
            type: Sequelize.STRING,
            allowNull: true,
          },
          { transaction }
        )
      }
    })
  },

  async down(queryInterface) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      for (const column of [...COLUMNS].reverse()) {
        await queryInterface.removeColumn('users', column, { transaction })
      }
    })
  },
}
