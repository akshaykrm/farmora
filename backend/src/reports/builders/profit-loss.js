import { schemaOf } from '../filters.js'
import { batchFilterMeta, selectBatches } from '../batches.js'
import { metricsFor, SNAPSHOT_KINDS } from '../snapshots.js'
import { dateRangeSql, num, query, ratio, round, sumRows } from '../helpers.js'

const BATCH_COLUMNS = [
  { key: 'name', header: 'Batch', width: 1.3 },
  { key: 'farm_name', header: 'Farm' },
  { key: 'status', header: 'Status', width: 0.7 },
  { key: 'sale_weight', header: 'Kg Sold', type: 'number' },
  { key: 'revenue', header: 'Revenue', type: 'currency' },
  { key: 'expense', header: 'Expense', type: 'currency' },
  { key: 'profit', header: 'Profit', type: 'currency' },
  { key: 'profit_per_kg', header: 'Profit/Kg', type: 'currency', width: 0.8 },
]

const PURPOSE_COLUMNS = [
  { key: 'purpose', header: 'Purpose', width: 2 },
  { key: 'entries', header: 'Entries', type: 'number' },
  { key: 'amount', header: 'Amount', type: 'currency' },
]

/**
 * General costs or general income (expense_sales) grouped by purpose. A season
 * filter matches the season overview; otherwise the date range applies.
 */
const byPurpose = async (table, masterId, filter) => {
  const range = filter.season_id
    ? { sql: '', replacements: {} }
    : dateRangeSql('date', filter, 'pl')
  const seasonSql = filter.season_id ? ' AND season_id = :seasonId' : ''
  const rows = await query(
    `SELECT purpose, COUNT(*) AS entries, SUM(amount) AS amount
     FROM ${table}
     WHERE master_id = :masterId AND status = 'active'${seasonSql}${range.sql}
     GROUP BY purpose
     ORDER BY SUM(amount) DESC`,
    { masterId, seasonId: filter.season_id, ...range.replacements }
  )
  return rows.map((row) => ({
    purpose: row.purpose,
    entries: num(row.entries),
    amount: round(row.amount),
  }))
}

const build = async (filter, { masterId }) => {
  const batches = await selectBatches(masterId, {
    ...filter,
    batch_status: filter.include_open ? undefined : 'closed',
  })
  const [financial, costs, income] = await Promise.all([
    metricsFor(batches, SNAPSHOT_KINDS.financial, masterId),
    byPurpose('general_expenses', masterId, filter),
    byPurpose('expense_sales', masterId, filter),
  ])

  const batchRows = batches.map((batch) => {
    const metrics = financial.get(batch.id) || {}
    return {
      name: batch.name,
      farm_name: batch.farm_name,
      status: batch.closed_on ? 'Closed' : 'Open',
      sale_weight: num(metrics.sale_weight),
      revenue: num(metrics.revenue),
      expense: num(metrics.expense),
      profit: num(metrics.profit),
      profit_per_kg: ratio(metrics.profit, metrics.sale_weight),
    }
  })

  const batchTotals = sumRows(batchRows, [
    'sale_weight',
    'revenue',
    'expense',
    'profit',
  ])
  const costTotals = sumRows(costs, ['entries', 'amount'])
  const incomeTotals = sumRows(income, ['entries', 'amount'])
  const netProfit = round(
    batchTotals.profit + incomeTotals.amount - costTotals.amount
  )

  const statement = [
    { line: 'Batch revenue', amount: batchTotals.revenue },
    { line: 'Batch expense', amount: -batchTotals.expense },
    { line: 'Batch profit', amount: batchTotals.profit },
    { line: 'General income', amount: incomeTotals.amount },
    { line: 'General cost', amount: -costTotals.amount },
  ]

  return {
    meta: [
      ...(await batchFilterMeta(masterId, filter)),
      {
        label: 'Batches',
        value: filter.include_open ? 'Open and closed' : 'Closed only',
      },
    ],
    summary: [
      { label: 'Batch Profit', value: batchTotals.profit, type: 'currency' },
      { label: 'General Income', value: incomeTotals.amount, type: 'currency' },
      { label: 'General Cost', value: costTotals.amount, type: 'currency' },
      { label: 'Net Profit', value: netProfit, type: 'currency' },
    ],
    chart: {
      type: 'bar',
      title: 'Profit and loss',
      x: 'line',
      series: [{ key: 'amount', label: 'Amount' }],
      data: statement,
    },
    sections: [
      {
        key: 'statement',
        title: 'Statement',
        columns: [
          { key: 'line', header: 'Line', width: 2 },
          { key: 'amount', header: 'Amount', type: 'currency' },
        ],
        rows: statement,
        total: { line: 'Net profit', amount: netProfit },
      },
      {
        key: 'batches',
        title: 'Batches',
        columns: BATCH_COLUMNS,
        rows: batchRows,
        total: {
          name: 'Total',
          ...batchTotals,
          profit_per_kg: ratio(batchTotals.profit, batchTotals.sale_weight),
        },
      },
      {
        key: 'general_costs',
        title: 'General Costs',
        columns: PURPOSE_COLUMNS,
        rows: costs,
        total: { purpose: 'Total', ...costTotals },
      },
      {
        key: 'general_income',
        title: 'General Income',
        columns: PURPOSE_COLUMNS,
        rows: income,
        total: { purpose: 'Total', ...incomeTotals },
      },
    ],
  }
}

export default {
  key: 'profit_loss',
  title: 'Profit and Loss',
  description:
    'Batch profit plus general income minus general cost, for a season or date range.',
  group: 'Finance',
  audience: 'tenant',
  schema: schemaOf(
    'season_id',
    'farm_id',
    'include_open',
    'start_date',
    'end_date'
  ),
  scope: { scopes: ['season_id'] },
  build,
}
