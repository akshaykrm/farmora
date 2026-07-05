const TYPES = [
  { code: 'CAPITAL_IN', name: 'Capital In', category: 'CAPITAL' },
  { code: 'CAPITAL_OUT', name: 'Capital Out', category: 'CAPITAL' },
  { code: 'PROFIT_CREDIT', name: 'Profit Credit', category: 'PROFIT' },
  { code: 'PROFIT_WITHDRAW', name: 'Profit Withdrawal', category: 'PROFIT' },
  { code: 'REVERSAL', name: 'Reversal', category: 'SYSTEM' },
]

export default {
  async up(queryInterface) {
    for (const t of TYPES) {
      await queryInterface.sequelize.query(
        `INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
         VALUES (:code, :name, :category, NOW(), NOW())
         ON CONFLICT (code) DO NOTHING;`,
        { replacements: { code: t.code, name: t.name, category: t.category } }
      )
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('investor_transaction_types', null, {})
  },
}
