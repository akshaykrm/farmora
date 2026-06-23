export default {
  async up(queryInterface, Sequelize) {
    const types = [
      { code: 'CAPITAL_IN', name: 'Capital In', category: 'CAPITAL' },
      { code: 'CAPITAL_OUT', name: 'Capital Out', category: 'CAPITAL' },
      { code: 'PROFIT_CREDIT', name: 'Profit Credit', category: 'PROFIT' },
      { code: 'PROFIT_WITHDRAW', name: 'Profit Withdrawal', category: 'PROFIT' },
      { code: 'REVERSAL', name: 'Reversal', category: 'SYSTEM' },
    ]

    for (const type of types) {
      await queryInterface.sequelize.query(`
        INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
        VALUES ('${type.code}', '${type.name}', '${type.category}', NOW(), NOW())
        ON CONFLICT (code) DO NOTHING;
      `)
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('investor_transaction_types', null, {})
  },
}
