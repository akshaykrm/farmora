export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_settings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
      sender_email: { type: Sequelize.STRING, allowNull: true },
      sender_name: { type: Sequelize.STRING, allowNull: true },
      encrypted_password: { type: Sequelize.TEXT, allowNull: true },
      smtp_host: { type: Sequelize.STRING, allowNull: true },
      smtp_port: { type: Sequelize.INTEGER, allowNull: true },
      smtp_secure: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      frontend_url: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.sequelize.query(
      'ALTER TABLE email_settings ADD CONSTRAINT email_settings_singleton CHECK (id = 1)'
    )

    await queryInterface.createTable('password_reset_tokens', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      token_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      used_at: { type: Sequelize.DATE, allowNull: true },
      request_ip: { type: Sequelize.STRING(64), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('password_reset_tokens', [
      'user_id',
      'created_at',
    ])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('password_reset_tokens')
    await queryInterface.dropTable('email_settings')
  },
}
