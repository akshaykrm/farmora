export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'user_limit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    })
    await queryInterface.sequelize.query(
      'ALTER TABLE packages ADD CONSTRAINT packages_user_limit_nonnegative CHECK (user_limit IS NULL OR user_limit >= 0)'
    )
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('packages', 'user_limit')
  },
}
