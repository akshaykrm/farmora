import { schemaOf } from '../filters.js'
import {
  dateRangeSql,
  idFiltersSql,
  nameOf,
  num,
  pagedQuery,
  query,
  round,
} from '../helpers.js'
import { dateMeta } from '@services/exports/helpers'

const COLUMNS = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'season_name', header: 'Season' },
  { key: 'batch_name', header: 'Batch' },
  { key: 'buyer_name', header: 'Buyer', width: 1.3 },
  { key: 'vehicle_no', header: 'Vehicle No' },
  { key: 'bird_no', header: 'Birds', type: 'number', width: 0.8 },
  { key: 'weight', header: 'Weight (kg)', type: 'number' },
  { key: 'avg_weight', header: 'Avg Wt', type: 'number', width: 0.7 },
  { key: 'price', header: 'Rate', type: 'currency', width: 0.8 },
  { key: 'amount', header: 'Amount', type: 'currency' },
  { key: 'payment_type', header: 'Payment', width: 0.8 },
]

/** WHERE clause shared by the sales reports. */
export const salesWhere = (masterId, filter) => {
  const range = dateRangeSql('s.date', filter, 'sale')
  const ids = idFiltersSql([
    ['s.season_id', 'season_id', filter.season_id],
    ['s.batch_id', 'batch_id', filter.batch_id],
    ['s.buyer_id', 'buyer_id', filter.buyer_id],
    ['s.payment_type', 'payment_type', filter.payment_type],
  ])
  return {
    sql: `s.master_id = :masterId AND s.deleted_at IS NULL${range.sql}${ids.sql}`,
    replacements: { masterId, ...range.replacements, ...ids.replacements },
  }
}

export const salesMeta = async (masterId, filter) => {
  const [season, batch, buyer] = await Promise.all([
    nameOf('seasons', filter.season_id, masterId),
    nameOf('batches', filter.batch_id, masterId),
    nameOf('vendors', filter.buyer_id, masterId),
  ])
  return [
    { label: 'Season', value: season },
    { label: 'Batch', value: batch },
    { label: 'Buyer', value: buyer },
    { label: 'Payment Type', value: filter.payment_type?.toUpperCase() },
    dateMeta(filter.start_date, filter.end_date),
  ]
}

const build = async (filter, ctx) => {
  const { masterId } = ctx
  const where = salesWhere(masterId, filter)
  const [totals] = await query(
    `SELECT COUNT(*) AS count, SUM(s.bird_no) AS birds, SUM(s.weight) AS weight,
            SUM(s.amount) AS amount
     FROM sales s WHERE ${where.sql}`,
    where.replacements
  )
  const count = num(totals.count)

  const { rows, pagination } = await pagedQuery({
    sql: `SELECT s.id, s.date, se.name AS season_name, b.name AS batch_name,
                 v.name AS buyer_name, s.vehicle_no, s.bird_no, s.weight,
                 s.avg_weight, s.price, s.amount, UPPER(s.payment_type::text) AS payment_type
          FROM sales s
          LEFT JOIN seasons se ON se.id = s.season_id
          LEFT JOIN batches b ON b.id = s.batch_id
          LEFT JOIN vendors v ON v.id = s.buyer_id
          WHERE ${where.sql}
          ORDER BY s.date DESC, s.id DESC`,
    replacements: where.replacements,
    count,
    ctx,
  })

  const weight = num(totals.weight)
  const birds = num(totals.birds)

  return {
    meta: await salesMeta(masterId, filter),
    summary: [
      { label: 'Bills', value: count, type: 'number' },
      { label: 'Birds', value: birds, type: 'number' },
      { label: 'Weight (kg)', value: round(weight), type: 'number' },
      { label: 'Amount', value: round(totals.amount), type: 'currency' },
      {
        label: 'Avg Rate / Kg',
        value: weight ? round(num(totals.amount) / weight) : 0,
        type: 'currency',
      },
    ],
    chart: null,
    sections: [
      {
        key: 'sales',
        title: 'Sales',
        columns: COLUMNS,
        rows,
        pagination,
        total: {
          date: 'Total',
          bird_no: birds,
          weight: round(weight),
          amount: round(totals.amount),
        },
      },
    ],
  }
}

export default {
  key: 'sales_register',
  title: 'Sales Register',
  description: 'Every sale with buyer, birds, weight, rate and amount.',
  group: 'Sales',
  audience: 'tenant',
  paged: true,
  schema: schemaOf(
    'season_id',
    'batch_id',
    'buyer_id',
    'payment_type',
    'start_date',
    'end_date'
  ),
  scope: {},
  build,
}
