export default {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface

    // Upsert PROFIT_LOSS type
    await queryInterface.sequelize.query(`
      INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
      VALUES ('PROFIT_LOSS', 'Profit Loss', 'PROFIT', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `)

    // Upsert CAPITAL_LOSS type
    await queryInterface.sequelize.query(`
      INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
      VALUES ('CAPITAL_LOSS', 'Capital Loss', 'CAPITAL', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `)

    // Find type IDs
    const [profitLossRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'PROFIT_LOSS'`
    )
    const profitLossId = profitLossRows[0]?.id
    if (!profitLossId) return

    const [capitalLossRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'CAPITAL_LOSS'`
    )
    const capitalLossId = capitalLossRows[0]?.id
    if (!capitalLossId) return

    const [oldLossRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'LOSS'`
    )
    const oldLossId = oldLossRows[0]?.id

    const [capitalOutRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'CAPITAL_OUT'`
    )
    const capitalOutId = capitalOutRows[0]?.id

    // Convert LOSS transactions to PROFIT_LOSS
    if (oldLossId) {
      await sequelize.query(
        `UPDATE investor_transactions SET transaction_type_id = :profitLossId WHERE transaction_type_id = :oldLossId`,
        { replacements: { profitLossId, oldLossId } }
      )
    }

    // Convert CAPITAL_OUT transactions that reference a LOSS/PROFIT_LOSS to CAPITAL_LOSS
    if (capitalOutId && profitLossId) {
      await sequelize.query(
        `UPDATE investor_transactions
         SET transaction_type_id = :capitalLossId
         WHERE transaction_type_id = :capitalOutId
           AND reference_transaction_id IS NOT NULL
           AND reference_transaction_id IN (
             SELECT id FROM investor_transactions WHERE transaction_type_id = :profitLossId
           )`,
        { replacements: { capitalLossId, capitalOutId, profitLossId } }
      )
    }

    // Remove the old LOSS type
    if (oldLossId) {
      await sequelize.query(
        `DELETE FROM investor_transaction_types WHERE code = 'LOSS'`
      )
    }
  },

  async down(queryInterface, Sequelize) {
    const { sequelize } = queryInterface

    const [profitLossRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'PROFIT_LOSS'`
    )
    const profitLossId = profitLossRows[0]?.id

    const [capitalLossRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'CAPITAL_LOSS'`
    )
    const capitalLossId = capitalLossRows[0]?.id

    const [capitalOutRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'CAPITAL_OUT'`
    )
    const capitalOutId = capitalOutRows[0]?.id

    // Upsert old LOSS type
    await sequelize.query(`
      INSERT INTO investor_transaction_types (code, name, category, created_at, updated_at)
      VALUES ('LOSS', 'Loss', 'PROFIT', NOW(), NOW())
      ON CONFLICT (code) DO NOTHING;
    `)

    const [oldLossRows] = await sequelize.query(
      `SELECT id FROM investor_transaction_types WHERE code = 'LOSS'`
    )
    const oldLossId = oldLossRows[0]?.id

    if (oldLossId && profitLossId) {
      // Convert PROFIT_LOSS back to LOSS
      await sequelize.query(
        `UPDATE investor_transactions SET transaction_type_id = :oldLossId WHERE transaction_type_id = :profitLossId`,
        { replacements: { oldLossId, profitLossId } }
      )
    }

    if (capitalOutId && capitalLossId) {
      // Convert CAPITAL_LOSS back to CAPITAL_OUT
      await sequelize.query(
        `UPDATE investor_transactions
         SET transaction_type_id = :capitalOutId
         WHERE transaction_type_id = :capitalLossId`,
        { replacements: { capitalOutId, capitalLossId } }
      )
    }

    // Remove the new types
    await sequelize.query(
      `DELETE FROM investor_transaction_types WHERE code IN ('PROFIT_LOSS', 'CAPITAL_LOSS')`
    )
  },
}
