import { schemaOf } from '../filters.js'
import { batchFilterMeta } from '../batches.js'
import { idFiltersSql, num, query, round, sumRows } from '../helpers.js'

const LOG_COLUMNS = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'batch_name', header: 'Batch', width: 1.3 },
  { key: 'mortality', header: 'Mortality', type: 'number' },
  { key: 'issued_feed', header: 'Feed Issued', type: 'number' },
  { key: 'consumed_feed', header: 'Feed Cons.', type: 'number' },
  { key: 'sold_birds', header: 'Birds Sold', type: 'number' },
  { key: 'sold_weight', header: 'Kg Sold', type: 'number' },
  { key: 'avg_body_weight', header: 'Body Wt', type: 'number' },
  { key: 'remarks', header: 'Remarks', width: 1.5 },
]

const DAY_COLUMNS = [
  { key: 'date', header: 'Date', type: 'date' },
  { key: 'batches', header: 'Batches Logged', type: 'number' },
  { key: 'mortality', header: 'Mortality', type: 'number' },
  { key: 'consumed_feed', header: 'Feed Cons.', type: 'number' },
  { key: 'sold_birds', header: 'Birds Sold', type: 'number' },
  { key: 'sold_weight', header: 'Kg Sold', type: 'number' },
]

const SUM_KEYS = [
  'mortality',
  'issued_feed',
  'consumed_feed',
  'sold_birds',
  'sold_weight',
]

const build = async (filter, { masterId }) => {
  const ids = idFiltersSql([
    ['l.batch_id', 'batch_id', filter.batch_id],
    ['b.farm_id', 'farm_id', filter.farm_id],
  ])
  const parts = []
  const replacements = { masterId, ...ids.replacements }
  if (filter.start_date) {
    parts.push('l.date >= :start')
    replacements.start = filter.start_date
  }
  if (filter.end_date) {
    parts.push('l.date <= :end')
    replacements.end = filter.end_date
  }
  if (filter.batch_status === 'open') parts.push('b.closed_on IS NULL')
  if (filter.batch_status === 'closed') parts.push('b.closed_on IS NOT NULL')

  const logs = await query(
    `SELECT l.date, b.name AS batch_name, l.mortality, l.issued_feed,
            l.consumed_feed, l.sold_birds, l.sold_weight, l.avg_body_weight,
            l.remarks
     FROM batch_daily_logs l
     JOIN batches b ON b.id = l.batch_id
     WHERE l.master_id = :masterId${ids.sql}${parts.length ? ` AND ${parts.join(' AND ')}` : ''}
     ORDER BY l.date ASC, b.name ASC`,
    replacements
  )

  const rows = logs.map((log) => ({
    ...log,
    mortality: num(log.mortality),
    issued_feed: round(log.issued_feed),
    consumed_feed: round(log.consumed_feed),
    sold_birds: num(log.sold_birds),
    sold_weight: round(log.sold_weight),
    avg_body_weight:
      log.avg_body_weight === null ? null : num(log.avg_body_weight),
  }))

  const days = new Map()
  for (const row of rows) {
    const day = days.get(row.date) || {
      date: row.date,
      batches: 0,
      mortality: 0,
      consumed_feed: 0,
      sold_birds: 0,
      sold_weight: 0,
    }
    day.batches += 1
    day.mortality += row.mortality
    day.consumed_feed = round(day.consumed_feed + row.consumed_feed)
    day.sold_birds += row.sold_birds
    day.sold_weight = round(day.sold_weight + row.sold_weight)
    days.set(row.date, day)
  }
  const dayRows = [...days.values()]
  const totals = sumRows(rows, SUM_KEYS)

  return {
    meta: await batchFilterMeta(masterId, filter),
    summary: [
      { label: 'Days', value: dayRows.length, type: 'number' },
      { label: 'Log Entries', value: rows.length, type: 'number' },
      { label: 'Mortality', value: totals.mortality, type: 'number' },
      {
        label: 'Feed Consumed (bags)',
        value: totals.consumed_feed,
        type: 'number',
      },
      { label: 'Birds Sold', value: totals.sold_birds, type: 'number' },
    ],
    chart: {
      type: 'line',
      title: 'Mortality and feed consumed per day',
      x: 'date',
      series: [
        { key: 'mortality', label: 'Mortality' },
        { key: 'consumed_feed', label: 'Feed (bags)' },
      ],
      data: dayRows,
    },
    sections: [
      {
        key: 'days',
        title: 'Per Day',
        columns: DAY_COLUMNS,
        rows: dayRows,
        total: { date: 'Total', batches: rows.length, ...totals },
      },
      {
        key: 'logs',
        title: 'Log Entries',
        columns: LOG_COLUMNS,
        rows,
        total: { date: 'Total', ...totals },
      },
    ],
  }
}

export default {
  key: 'daily_production',
  title: 'Daily Production',
  description:
    'Day-by-day mortality, feed consumed and birds sold across batches, from the daily log.',
  group: 'Production',
  audience: 'tenant',
  schema: schemaOf(
    'batch_id',
    'farm_id',
    'batch_status',
    'start_date',
    'end_date'
  ),
  scope: { scopes: ['batch_id'], maxDays: 62 },
  build,
}
