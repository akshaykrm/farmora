export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('investor_transaction_types', [
      {
        code: 'CAPITAL_IN',
        name: 'Capital In',
        category: 'CAPITAL',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'CAPITAL_OUT',
        name: 'Capital Out',
        category: 'CAPITAL',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'PROFIT_CREDIT',
        name: 'Profit Credit',
        category: 'PROFIT',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'PROFIT_WITHDRAW',
        name: 'Profit Withdrawal',
        category: 'PROFIT',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'LOSS',
        name: 'Loss',
        category: 'PROFIT',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'REVERSAL',
        name: 'Reversal',
        category: 'SYSTEM',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('investor_transaction_types', null, {})
  },
}
