'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const updatedAt = new Date()

    await queryInterface.bulkUpdate(
      'packages',
      {
        price: 2999,
        updated_at: updatedAt,
      },
      {
        name: 'Basic',
      }
    )

    await queryInterface.bulkUpdate(
      'packages',
      {
        price: 5999,
        updated_at: updatedAt,
      },
      {
        name: 'Premium',
      }
    )

    await queryInterface.bulkUpdate(
      'packages',
      {
        price: 7999,
        updated_at: updatedAt,
      },
      {
        name: 'Enterprise',
      }
    )
  },

  async down(queryInterface, Sequelize) {
    const updatedAt = new Date()

    await queryInterface.bulkUpdate(
      'packages',
      {
        price: 0,
        updated_at: updatedAt,
      },
      {
        name: 'Basic',
      }
    )

    await queryInterface.bulkUpdate(
      'packages',
      {
        price: 999,
        updated_at: updatedAt,
      },
      {
        name: 'Premium',
      }
    )

    await queryInterface.bulkUpdate(
      'packages',
      {
        price: 2999,
        updated_at: updatedAt,
      },
      {
        name: 'Enterprise',
      }
    )
  },
}
