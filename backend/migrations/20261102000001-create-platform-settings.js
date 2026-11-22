export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('platform_settings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
      subscription_reminder_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
    })
    await queryInterface.sequelize.query(
      'ALTER TABLE platform_settings ADD CONSTRAINT platform_settings_singleton CHECK (id = 1), ADD CONSTRAINT platform_settings_reminder_days_range CHECK (subscription_reminder_days BETWEEN 0 AND 365)'
    )
    await queryInterface.bulkInsert('platform_settings', [
      { id: 1, subscription_reminder_days: 10 },
    ])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('platform_settings')
  },
}
