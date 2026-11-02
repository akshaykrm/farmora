export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('packages', 'batch_limit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    })
    await queryInterface.sequelize.query(
      'ALTER TABLE packages ADD CONSTRAINT packages_batch_limit_nonnegative CHECK (batch_limit IS NULL OR batch_limit >= 0)'
    )
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('packages', 'batch_limit')
  },
}
