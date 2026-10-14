import { schemaOf } from '../filters.js'
import { num, query, ratio, round, sumRows } from '../helpers.js'
import { salesMeta, salesWhere } from './sales-register.js'

const COLUMNS = [
  { key: 'buyer_name', header: 'Buyer', width: 1.5 },
  { key: 'bills', header: 'Bills', type: 'number', width: 0.7 },
  { key: 'birds', header: 'Birds', type: 'number' },
  { key: 'weight', header: 'Weight (kg)', type: 'number' },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'avg_rate', header: 'Avg Rate/Kg', type: 'currency' },
  { key: 'cash', header: 'Cash', type: 'currency' },
  { key: 'credit', header: 'Credit', type: 'currency' },
  { key: 'paid', header: 'Paid', type: 'currency' },
]

const build = async (filter, { masterId }) => {
  const where = salesWhere(masterId, filter)
  const grouped = await query(
    `SELECT s.buyer_id, COALESCE(v.name, 'Unknown') AS buyer_name,
            COUNT(*) AS bills, SUM(s.bird_no) AS birds, SUM(s.weight) AS weight,
            SUM(s.amount) AS amount,
            SUM(s.amount) FILTER (WHERE s.payment_type = 'cash') AS cash,
            SUM(s.amount) FILTER (WHERE s.payment_type = 'credit') AS credit,
            SUM(s.amount) FILTER (WHERE s.payment_type = 'paid') AS paid
     FROM sales s
     LEFT JOIN vendors v ON v.id = s.buyer_id
     WHERE ${where.sql}
     GROUP BY s.buyer_id, v.name
     ORDER BY SUM(s.amount) DESC NULLS LAST`,
    where.replacements
  )

  const rows = grouped.map((row) => ({
    buyer_name: row.buyer_name,
    bills: num(row.bills),
    birds: num(row.birds),
    weight: round(row.weight),
    amount: round(row.amount),
    avg_rate: ratio(row.amount, row.weight),
    cash: round(row.cash),
    credit: round(row.credit),
    paid: round(row.paid),
  }))
  const totals = sumRows(rows, [
    'bills',
    'birds',
    'weight',
    'amount',
    'cash',
    'credit',
    'paid',
  ])

  return {
    meta: await salesMeta(masterId, filter),
    summary: [
      { label: 'Buyers', value: rows.length, type: 'number' },
      { label: 'Weight (kg)', value: totals.weight, type: 'number' },
      { label: 'Amount', value: totals.amount, type: 'currency' },
      { label: 'Credit', value: totals.credit, type: 'currency' },
      {
        label: 'Avg Rate / Kg',
        value: ratio(totals.amount, totals.weight),
        type: 'currency',
      },
    ],
    chart: {
      type: 'bar',
      title: 'Top 10 buyers by amount',
      x: 'buyer_name',
      series: [{ key: 'amount', label: 'Amount' }],
      data: rows.slice(0, 10),
    },
    sections: [
      {
        key: 'buyers',
        title: 'Buyers',
        columns: COLUMNS,
        rows,
        total: {
          buyer_name: 'Total',
          ...totals,
          avg_rate: ratio(totals.amount, totals.weight),
        },
      },
    ],
  }
}

export default {
  key: 'buyer_sales',
  title: 'Buyer-wise Sales',
  description:
    'Sales totals for each buyer with average rate and cash/credit split.',
  group: 'Sales',
  audience: 'tenant',
  schema: schemaOf(
    'season_id',
    'batch_id',
    'payment_type',
    'start_date',
    'end_date'
  ),
  scope: {},
  build,
}
