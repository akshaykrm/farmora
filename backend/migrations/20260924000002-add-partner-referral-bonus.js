'use strict'
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('referral_partners', 'referral_bonus_type', {
      type: Sequelize.ENUM('none', 'fixed', 'percentage'),
      allowNull: false,
      defaultValue: 'none',
    })
    await queryInterface.addColumn('referral_partners', 'referral_bonus_value', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('referral_partners', 'referral_bonus_value')
    await queryInterface.removeColumn('referral_partners', 'referral_bonus_type')
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_referral_partners_referral_bonus_type";'
    )
  },
}
