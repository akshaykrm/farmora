export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
      VALUES ('LOSS', 'Loss', 'PROFIT', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM investor_transaction_types WHERE code = 'LOSS';
    `)
  },
}
