'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'bird_capacity',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      )

      await queryInterface.sequelize.query(
        `UPDATE users
         SET bird_capacity = COALESCE(NULLIF(capacity, ''), NULLIF(bird, ''))
         WHERE bird_capacity IS NULL`,
        { transaction }
      )

      await queryInterface.removeColumn('users', 'bird', { transaction })
      await queryInterface.removeColumn('users', 'capacity', { transaction })
    })
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'bird',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      )
      await queryInterface.addColumn(
        'users',
        'capacity',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      )

      await queryInterface.sequelize.query(
        `UPDATE users SET capacity = bird_capacity WHERE bird_capacity IS NOT NULL`,
        { transaction }
      )

      await queryInterface.removeColumn('users', 'bird_capacity', {
        transaction,
      })
    })
  },
}
