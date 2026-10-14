import dayjs from 'dayjs'
import { schemaOf } from '../filters.js'
import {
  dateRangeSql,
  idFiltersSql,
  nameOf,
  num,
  query,
  round,
  sumRows,
} from '../helpers.js'
import { dateMeta } from '@services/exports/helpers'

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const ITEM_TYPE_LABELS = {
  chick: 'Chicks',
  medicine: 'Medicine',
  FINISHER: 'Feed (Finisher)',
  STARTER: 'Feed (Starter)',
  'PRE STARTER': 'Feed (Pre Starter)',
  integration: 'Integration',
  working: 'Working',
  regular: 'Regular',
  general: 'General',
}

const build = async (filter, { masterId }) => {
  const seasonIds = idFiltersSql([['season_id', 'season_id', filter.season_id]])
  const expenseRange = dateRangeSql('date', filter, 'expense')
  const expenseWhere = `master_id = :masterId AND status = 'active'${seasonIds.sql}${expenseRange.sql}`
  const expenseReplacements = {
    masterId,
    tz: TIMEZONE,
    ...seasonIds.replacements,
    ...expenseRange.replacements,
  }

  const purchaseIds = idFiltersSql([
    ['p.season_id', 'season_id', filter.season_id],
  ])
  const purchaseRange = dateRangeSql('p.invoice_date', filter, 'purchase')

  const [purposes, months, itemTypes] = await Promise.all([
    query(
      `SELECT purpose, COUNT(*) AS entries, SUM(amount) AS amount
       FROM general_expenses WHERE ${expenseWhere}
       GROUP BY purpose ORDER BY SUM(amount) DESC`,
      expenseReplacements
    ),
    query(
      `SELECT to_char(date AT TIME ZONE :tz, 'YYYY-MM') AS month, SUM(amount) AS amount
       FROM general_expenses WHERE ${expenseWhere}
       GROUP BY 1 ORDER BY 1`,
      expenseReplacements
    ),
    query(
      `SELECT COALESCE(i.type::text, 'regular') AS item_type, COUNT(*) AS bills,
              SUM(p.quantity) AS quantity, SUM(p.net_amount) AS amount
       FROM purchases p LEFT JOIN items i ON i.id = p.category_id
       WHERE p.master_id = :masterId${purchaseIds.sql}${purchaseRange.sql}
       GROUP BY 1 ORDER BY SUM(p.net_amount) DESC`,
      { masterId, ...purchaseIds.replacements, ...purchaseRange.replacements }
    ),
  ])

  const purposeRows = purposes.map((row) => ({
    purpose: row.purpose,
    entries: num(row.entries),
    amount: round(row.amount),
  }))
  const monthRows = months.map((row) => ({
    month: dayjs(`${row.month}-01`).format('MMM YYYY'),
    amount: round(row.amount),
  }))
  const itemRows = itemTypes.map((row) => ({
    item_type: ITEM_TYPE_LABELS[row.item_type] || row.item_type,
    bills: num(row.bills),
    quantity: num(row.quantity),
    amount: round(row.amount),
  }))

  const purposeTotals = sumRows(purposeRows, ['entries', 'amount'])
  const itemTotals = sumRows(itemRows, ['bills', 'quantity', 'amount'])

  return {
    meta: [
      {
        label: 'Season',
        value: await nameOf('seasons', filter.season_id, masterId),
      },
      dateMeta(filter.start_date, filter.end_date),
    ],
    summary: [
      {
        label: 'General Expenses',
        value: purposeTotals.amount,
        type: 'currency',
      },
      { label: 'Purchases', value: itemTotals.amount, type: 'currency' },
      {
        label: 'Total Spend',
        value: round(purposeTotals.amount + itemTotals.amount),
        type: 'currency',
      },
      { label: 'Expense Purposes', value: purposeRows.length, type: 'number' },
    ],
    chart: {
      type: 'pie',
      title: 'General expenses by purpose',
      x: 'purpose',
      series: [{ key: 'amount', label: 'Amount' }],
      data: purposeRows.slice(0, 8),
    },
    charts: [
      {
        type: 'bar',
        title: 'General expenses by month',
        x: 'month',
        series: [{ key: 'amount', label: 'Amount' }],
        data: monthRows,
      },
      {
        type: 'pie',
        title: 'Purchases by item type',
        x: 'item_type',
        series: [{ key: 'amount', label: 'Amount' }],
        data: itemRows,
      },
    ],
    sections: [
      {
        key: 'purposes',
        title: 'General Expenses by Purpose',
        columns: [
          { key: 'purpose', header: 'Purpose', width: 2 },
          { key: 'entries', header: 'Entries', type: 'number' },
          { key: 'amount', header: 'Amount', type: 'currency' },
        ],
        rows: purposeRows,
        total: { purpose: 'Total', ...purposeTotals },
      },
      {
        key: 'months',
        title: 'General Expenses by Month',
        columns: [
          { key: 'month', header: 'Month', width: 1.5 },
          { key: 'amount', header: 'Amount', type: 'currency' },
        ],
        rows: monthRows,
        total: { month: 'Total', amount: purposeTotals.amount },
      },
      {
        key: 'item_types',
        title: 'Purchases by Item Type',
        columns: [
          { key: 'item_type', header: 'Item Type', width: 1.5 },
          { key: 'bills', header: 'Bills', type: 'number' },
          { key: 'quantity', header: 'Quantity', type: 'number' },
          { key: 'amount', header: 'Amount', type: 'currency' },
        ],
        rows: itemRows,
        total: { item_type: 'Total', ...itemTotals },
      },
    ],
  }
}

export default {
  key: 'expense_breakdown',
  title: 'Expense Breakdown',
  description:
    'General expenses by purpose and month, and purchases by item type.',
  group: 'Finance',
  audience: 'tenant',
  schema: schemaOf('season_id', 'start_date', 'end_date'),
  scope: { scopes: ['season_id'] },
  build,
}
