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
  { key: 'invoice_date', header: 'Date', type: 'date' },
  { key: 'invoice_number', header: 'Invoice No' },
  { key: 'vendor_name', header: 'Supplier', width: 1.3 },
  { key: 'item_name', header: 'Item', width: 1.2 },
  { key: 'item_type', header: 'Type', width: 0.8 },
  { key: 'batch_name', header: 'Batch' },
  { key: 'quantity', header: 'Qty', type: 'number', width: 0.6 },
  { key: 'price_per_unit', header: 'Rate', type: 'currency', width: 0.8 },
  { key: 'total_price', header: 'Total', type: 'currency' },
  { key: 'discount_price', header: 'Discount', type: 'currency', width: 0.8 },
  { key: 'net_amount', header: 'Net Amount', type: 'currency' },
  { key: 'payment_type', header: 'Payment', width: 0.7 },
]

const ITEM_COLUMNS = [
  { key: 'item_name', header: 'Item', width: 1.5 },
  { key: 'item_type', header: 'Type' },
  { key: 'bills', header: 'Bills', type: 'number' },
  { key: 'quantity', header: 'Qty', type: 'number' },
  { key: 'net_amount', header: 'Net Amount', type: 'currency' },
  { key: 'avg_rate', header: 'Avg Rate', type: 'currency' },
]

const build = async (filter, ctx) => {
  const { masterId } = ctx
  const range = dateRangeSql('p.invoice_date', filter, 'purchase')
  const ids = idFiltersSql([
    ['p.season_id', 'season_id', filter.season_id],
    ['p.batch_id', 'batch_id', filter.batch_id],
    ['p.farm_id', 'farm_id', filter.farm_id],
    ['p.vendor_id', 'vendor_id', filter.vendor_id],
    ['p.payment_type', 'payment_type', filter.payment_type],
  ])
  const where = `p.master_id = :masterId${range.sql}${ids.sql}`
  const replacements = { masterId, ...range.replacements, ...ids.replacements }

  const [[totals], items] = await Promise.all([
    query(
      `SELECT COUNT(*) AS count, SUM(p.quantity) AS quantity,
              SUM(p.total_price) AS total_price, SUM(p.net_amount) AS net_amount,
              SUM(p.net_amount) FILTER (WHERE p.payment_type = 'credit') AS credit
       FROM purchases p WHERE ${where}`,
      replacements
    ),
    query(
      `SELECT COALESCE(i.name, p.name) AS item_name, i.type AS item_type,
              COUNT(*) AS bills, SUM(p.quantity) AS quantity,
              SUM(p.net_amount) AS net_amount
       FROM purchases p LEFT JOIN items i ON i.id = p.category_id
       WHERE ${where}
       GROUP BY COALESCE(i.name, p.name), i.type
       ORDER BY SUM(p.net_amount) DESC NULLS LAST`,
      replacements
    ),
  ])
  const count = num(totals.count)

  const { rows, pagination } = await pagedQuery({
    sql: `SELECT p.id, p.invoice_date, p.invoice_number, v.name AS vendor_name,
                 COALESCE(i.name, p.name) AS item_name, i.type AS item_type,
                 b.name AS batch_name, p.quantity, p.price_per_unit, p.total_price,
                 p.discount_price, p.net_amount,
                 UPPER(p.payment_type::text) AS payment_type
          FROM purchases p
          LEFT JOIN items i ON i.id = p.category_id
          LEFT JOIN vendors v ON v.id = p.vendor_id
          LEFT JOIN batches b ON b.id = p.batch_id
          WHERE ${where}
          ORDER BY p.invoice_date DESC, p.id DESC`,
    replacements,
    count,
    ctx,
  })

  const itemRows = items.map((item) => ({
    item_name: item.item_name,
    item_type: item.item_type,
    bills: num(item.bills),
    quantity: num(item.quantity),
    net_amount: round(item.net_amount),
    avg_rate: num(item.quantity)
      ? round(num(item.net_amount) / num(item.quantity))
      : 0,
  }))

  const [season, batch, farm, vendor] = await Promise.all([
    nameOf('seasons', filter.season_id, masterId),
    nameOf('batches', filter.batch_id, masterId),
    nameOf('farms', filter.farm_id, masterId),
    nameOf('vendors', filter.vendor_id, masterId),
  ])

  return {
    meta: [
      { label: 'Season', value: season },
      { label: 'Batch', value: batch },
      { label: 'Farm', value: farm },
      { label: 'Supplier', value: vendor },
      { label: 'Payment Type', value: filter.payment_type?.toUpperCase() },
      dateMeta(filter.start_date, filter.end_date),
    ],
    summary: [
      { label: 'Bills', value: count, type: 'number' },
      { label: 'Quantity', value: num(totals.quantity), type: 'number' },
      {
        label: 'Net Amount',
        value: round(totals.net_amount),
        type: 'currency',
      },
      { label: 'On Credit', value: round(totals.credit), type: 'currency' },
    ],
    chart: {
      type: 'pie',
      title: 'Net amount by item',
      x: 'item_name',
      series: [{ key: 'net_amount', label: 'Net Amount' }],
      data: itemRows.slice(0, 8),
    },
    sections: [
      {
        key: 'items',
        title: 'Item-wise Summary',
        columns: ITEM_COLUMNS,
        rows: itemRows,
        total: {
          item_name: 'Total',
          bills: count,
          quantity: num(totals.quantity),
          net_amount: round(totals.net_amount),
        },
      },
      {
        key: 'purchases',
        title: 'Purchases',
        columns: COLUMNS,
        rows,
        pagination,
        total: {
          invoice_date: 'Total',
          quantity: num(totals.quantity),
          total_price: round(totals.total_price),
          net_amount: round(totals.net_amount),
        },
      },
    ],
  }
}

export default {
  key: 'purchase_register',
  title: 'Purchase Register',
  description:
    'Every purchase bill, with an item-wise summary of quantity and amount.',
  group: 'Purchases',
  audience: 'tenant',
  paged: true,
  schema: schemaOf(
    'season_id',
    'batch_id',
    'farm_id',
    'vendor_id',
    'payment_type',
    'start_date',
    'end_date'
  ),
  scope: {},
  build,
}
