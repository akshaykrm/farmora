'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('packages', [
      {
        name: 'Basic',
        price: 0,
        description: 'Basic package with essential features.',
        duration: 6,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Premium',
        price: 999,
        duration: 1,
        description: 'Premium package for growing operations.',
        status: 'inactive',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Enterprise',
        price: 2999,
        duration: 1,
        description: 'Enterprise package for large-scale operations.',
        status: 'inactive',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'packages',
      [{ name: 'Basic' }, { name: 'Premium' }, { name: 'Enterprise' }],
      {}
    )
  },
}
