'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('packages', [
      {
        name: 'Basic',
        actual_price: 2999,
        discount_price: 2999,
        description: 'Basic package with essential features.',
        duration: 6,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Premium',
        actual_price: 5999,
        discount_price: 0,
        duration: 1,
        description: 'Standard package for growing operations.',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Enterprise',
        actual_price: 7999,
        discount_price: 0,
        duration: 1,
        description: 'Premium package for large-scale operations.',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'packages',
      [{ name: 'Basic' }, { name: 'Standard' }, { name: 'Premium' }],
      {}
    )
  },
}
