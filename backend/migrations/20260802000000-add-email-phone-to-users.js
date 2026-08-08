'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'email',
        {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        { transaction }
      )

      await queryInterface.addColumn(
        'users',
        'phone',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      )
    })
  },

  async down(queryInterface) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'phone', { transaction })
      await queryInterface.removeColumn('users', 'email', { transaction })
    })
  },
}
