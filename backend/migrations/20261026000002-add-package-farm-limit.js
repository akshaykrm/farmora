export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'farm_limit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    })
    await queryInterface.sequelize.query(
      'ALTER TABLE packages ADD CONSTRAINT packages_farm_limit_nonnegative CHECK (farm_limit IS NULL OR farm_limit >= 0)'
    )
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('packages', 'farm_limit')
  },
}
