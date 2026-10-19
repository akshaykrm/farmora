import { schemaOf } from '../filters.js'
import { batchFilterMeta, selectBatches } from '../batches.js'
import { metricsFor, SNAPSHOT_KINDS } from '../snapshots.js'
import { FEED_BAG_KG } from '@utils/feed'
import { pct, ratio, sumRows } from '../helpers.js'

const COLUMNS = [
  { key: 'name', header: 'Batch', width: 1.3 },
  { key: 'season_name', header: 'Season' },
  { key: 'status', header: 'Status', width: 0.7 },
  { key: 'start_date', header: 'Start', type: 'date' },
  { key: 'age', header: 'Day', type: 'number', width: 0.6 },
  { key: 'chicks_placed', header: 'Chicks', type: 'number' },
  { key: 'mortality', header: 'Mortality', type: 'number' },
  { key: 'mortality_pct', header: 'Mort %', type: 'number', width: 0.7 },
  { key: 'feed_issued', header: 'Feed Issued', type: 'number' },
  { key: 'feed_consumed', header: 'Feed Cons.', type: 'number' },
  { key: 'feed_stock', header: 'Feed Stock', type: 'number' },
  { key: 'sold_birds', header: 'Birds Sold', type: 'number' },
  { key: 'sold_weight', header: 'Kg Sold', type: 'number' },
  { key: 'birds_on_farm', header: 'On Farm', type: 'number' },
  { key: 'last_body_weight', header: 'Body Wt', type: 'number', width: 0.7 },
  { key: 'fcr', header: 'FCR', type: 'number', width: 0.6 },
  { key: 'log_count', header: 'Logs', type: 'number', width: 0.6 },
]

const SUM_KEYS = [
  'chicks_placed',
  'mortality',
  'feed_issued',
  'feed_consumed',
  'feed_stock',
  'sold_birds',
  'sold_weight',
  'birds_on_farm',
  'log_count',
]

const build = async (filter, { masterId }) => {
  const batches = await selectBatches(masterId, filter)
  const metrics = await metricsFor(batches, SNAPSHOT_KINDS.dailyLog, masterId)

  const rows = batches.map((batch) => ({
    id: batch.id,
    name: batch.name,
    season_name: batch.season_name,
    status: batch.closed_on ? 'Closed' : 'Open',
    ...metrics.get(batch.id),
  }))

  const totals = sumRows(rows, SUM_KEYS)
  const mortalityPct = pct(totals.mortality, totals.chicks_placed)
  const fcr = ratio(totals.feed_consumed * FEED_BAG_KG, totals.sold_weight, 3)

  return {
    meta: await batchFilterMeta(masterId, filter),
    summary: [
      { label: 'Batches', value: rows.length, type: 'number' },
      { label: 'Chicks Placed', value: totals.chicks_placed, type: 'number' },
      { label: 'Mortality', value: totals.mortality, type: 'number' },
      { label: 'Mortality %', value: mortalityPct, type: 'number' },
      { label: 'Birds on Farm', value: totals.birds_on_farm, type: 'number' },
      {
        label: 'Feed Consumed (bags)',
        value: totals.feed_consumed,
        type: 'number',
      },
      { label: 'FCR', value: fcr, type: 'number' },
    ],
    chart: {
      type: 'bar',
      title: 'Mortality % by batch',
      x: 'name',
      series: [{ key: 'mortality_pct', label: 'Mortality %' }],
      data: rows.map((row) => ({
        name: row.name,
        mortality_pct: row.mortality_pct,
      })),
    },
    sections: [
      {
        key: 'batches',
        title: 'Batches',
        columns: COLUMNS,
        rows,
        total: { name: 'Total', ...totals, mortality_pct: mortalityPct, fcr },
      },
    ],
  }
}

export default {
  key: 'batch_daily_log',
  title: 'Batch Performance (Daily Log)',
  description:
    'Mortality, feed consumed, birds sold and birds on farm for each batch, from the daily log.',
  group: 'Production',
  audience: 'tenant',
  schema: schemaOf(
    'season_id',
    'farm_id',
    'batch_id',
    'batch_status',
    'start_date',
    'end_date'
  ),
  scope: {},
  build,
}
