'use strict'
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'kind', {
      type: Sequelize.ENUM('initial', 'renewal'),
      allowNull: false,
      defaultValue: 'initial',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('subscriptions', 'kind')
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_subscriptions_kind";'
    )
  },
}
