export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
      VALUES ('PROFIT_LOSS', 'Profit Loss', 'PROFIT', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `)

    await queryInterface.sequelize.query(`
      INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
      VALUES ('SETOFF', 'Set Off', 'SYSTEM', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM investor_transaction_types WHERE code IN ('PROFIT_LOSS', 'SETOFF');
    `)
  },
}
