export default {
  async up(queryInterface) {
    const staleTypeIds = (
      await queryInterface.sequelize.query(
        `SELECT id FROM investor_transaction_types WHERE code IN ('LOSS', 'PROFIT_LOSS', 'CAPITAL_LOSS')`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )
    ).map((r) => r.id)

    if (staleTypeIds.length > 0) {
      const ids = staleTypeIds.join(',')

      await queryInterface.sequelize.query(`
        DELETE FROM investor_transactions
        WHERE reference_transaction_id IN (
          SELECT id FROM investor_transactions
          WHERE transaction_type_id IN (${ids})
        )
      `)

      await queryInterface.sequelize.query(`
        DELETE FROM investor_transactions
        WHERE transaction_type_id IN (${ids})
      `)

      await queryInterface.sequelize.query(`
        DELETE FROM investor_transaction_types
        WHERE id IN (${ids})
      `)
    }

    await queryInterface.sequelize.query(`
      DELETE FROM "SequelizeMeta"
      WHERE name LIKE '%add-loss-transaction-type%'
         OR name LIKE '%migrate-loss-to-profit%'
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM "SequelizeMeta"
      WHERE name LIKE '%cleanup-reverted-loss-types%'
    `)
  },
}
