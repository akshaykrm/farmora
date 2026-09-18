'use strict'
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'referral_partner_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'referral_partners',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'referral_partner_id')
  },
}
