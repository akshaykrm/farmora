export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_gateway_settings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      key_id: { type: Sequelize.STRING, allowNull: false },
      encrypted_key_secret: { type: Sequelize.TEXT, allowNull: false },
      encrypted_webhook_secret: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.createTable('checkout_orders', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      request_id: { type: Sequelize.UUID, allowNull: false, unique: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'packages', key: 'id' },
      },
      kind: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false },
      package_snapshot: { type: Sequelize.JSONB, allowNull: false },
      referral_partner_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'referral_partners', key: 'id' },
      },
      referral_snapshot: { type: Sequelize.JSONB, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false },
      razorpay_order_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      razorpay_payment_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      gateway_settings_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'payment_gateway_settings', key: 'id' },
      },
      subscription_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: { model: 'subscriptions', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('checkout_orders', ['user_id', 'status'])
    // Keep historical methods while allowing actual Razorpay method names.
    await queryInterface.sequelize.query(
      'ALTER TABLE payments ALTER COLUMN payment_method TYPE VARCHAR(50) USING payment_method::text'
    )
  },
  async down(queryInterface) {
    await queryInterface.dropTable('checkout_orders')
    await queryInterface.dropTable('payment_gateway_settings')
    // Preserve VARCHAR so rollback cannot discard newly recorded payment methods.
  },
}
