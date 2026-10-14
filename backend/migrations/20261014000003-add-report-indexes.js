'use strict'

const INDEXES = [
  ['sales', ['master_id', 'date']],
  ['sales', ['master_id', 'batch_id']],
  ['purchases', ['master_id', 'invoice_date']],
  ['purchases', ['master_id', 'batch_id']],
  ['purchase_returns', ['master_id', 'date']],
  ['purchase_returns', ['from_batch']],
  ['purchase_returns', ['to_batch']],
  ['general_expenses', ['master_id', 'date']],
  ['expense_sales', ['master_id', 'date']],
  ['working_costs', ['master_id', 'date']],
  ['integration_books', ['master_id', 'date']],
  ['purchase_books', ['master_id', 'vendor_id', 'date']],
  ['subscriptions', ['valid_to']],
  ['payments', ['status', 'created_at']],
]

const indexName = (table, columns) => `${table}_${columns.join('_')}_report_idx`

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    for (const [table, columns] of INDEXES) {
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS "${indexName(table, columns)}" ON "${table}" (${columns
          .map((column) => `"${column}"`)
          .join(', ')})`
      )
    }
  },

  async down(queryInterface) {
    for (const [table, columns] of INDEXES) {
      await queryInterface.sequelize.query(
        `DROP INDEX IF EXISTS "${indexName(table, columns)}"`
      )
    }
  },
}
