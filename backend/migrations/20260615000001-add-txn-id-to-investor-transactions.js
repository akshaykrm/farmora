export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE investor_transactions
      ADD COLUMN txn_id VARCHAR(50)
      GENERATED ALWAYS AS ('txn-' || id) STORED;
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE investor_transactions DROP COLUMN txn_id;
    `)
  },
}
