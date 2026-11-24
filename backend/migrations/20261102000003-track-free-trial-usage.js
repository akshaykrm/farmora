export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'free_trial_used_at', {
      type: Sequelize.DATE,
      allowNull: true,
    })
    await queryInterface.sequelize.query(`
      UPDATE users u SET free_trial_used_at = COALESCE(
        (SELECT MIN(c.created_at) FROM checkout_orders c WHERE c.user_id = u.id AND c.amount = 0 AND c.status = 'completed'),
        (SELECT MIN(s.created_at) FROM subscriptions s JOIN packages p ON p.id = s.package_id WHERE s.user_id = u.id AND p.actual_price - p.discount_price <= 0)
      ) WHERE u.free_trial_used_at IS NULL
    `)
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'free_trial_used_at')
  },
}
