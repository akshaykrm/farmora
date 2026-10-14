import { schemaOf } from '../filters.js'
import { batchFilterMeta, selectBatches } from '../batches.js'
import { metricsFor, SNAPSHOT_KINDS } from '../snapshots.js'
import { FEED_BAG_KG } from '@utils/feed'
import { ratio, round, sumRows } from '../helpers.js'

const COLUMNS = [
  { key: 'name', header: 'Batch', width: 1.3 },
  { key: 'season_name', header: 'Season' },
  { key: 'farm_name', header: 'Farm' },
  { key: 'status', header: 'Status', width: 0.7 },
  { key: 'chicks_placed', header: 'Chicks', type: 'number' },
  { key: 'net_feed_bags', header: 'Feed (bags)', type: 'number' },
  { key: 'sale_birds', header: 'Birds Sold', type: 'number' },
  { key: 'sale_weight', header: 'Kg Sold', type: 'number' },
  { key: 'avg_weight', header: 'Avg Wt', type: 'number', width: 0.7 },
  { key: 'fcr', header: 'FCR', type: 'number', width: 0.7 },
  { key: 'cfcr', header: 'CFCR', type: 'number', width: 0.7 },
  { key: 'expense', header: 'Expense', type: 'currency' },
  { key: 'revenue', header: 'Revenue', type: 'currency' },
  { key: 'profit', header: 'Profit', type: 'currency' },
  { key: 'cost_per_kg', header: 'Cost/Kg', type: 'currency', width: 0.8 },
  { key: 'rate_per_kg', header: 'Rate/Kg', type: 'currency', width: 0.8 },
]

const SUM_KEYS = [
  'chicks_placed',
  'net_feed_bags',
  'sale_birds',
  'sale_weight',
  'expense',
  'revenue',
  'profit',
]

const build = async (filter, { masterId }) => {
  const batches = await selectBatches(masterId, filter)
  const metrics = await metricsFor(batches, SNAPSHOT_KINDS.financial, masterId)

  const rows = batches.map((batch) => ({
    id: batch.id,
    name: batch.name,
    season_name: batch.season_name,
    farm_name: batch.farm_name,
    status: batch.closed_on ? 'Closed' : 'Open',
    ...metrics.get(batch.id),
  }))

  const totals = sumRows(rows, SUM_KEYS)
  const feedKg = totals.net_feed_bags * FEED_BAG_KG
  const avgWeight = ratio(totals.sale_weight, totals.sale_birds, 3)
  const fcr = ratio(feedKg, totals.sale_weight, 3)

  return {
    meta: await batchFilterMeta(masterId, filter),
    summary: [
      { label: 'Batches', value: rows.length, type: 'number' },
      { label: 'Kg Sold', value: totals.sale_weight, type: 'number' },
      { label: 'Revenue', value: totals.revenue, type: 'currency' },
      { label: 'Expense', value: totals.expense, type: 'currency' },
      { label: 'Profit', value: totals.profit, type: 'currency' },
      { label: 'Overall FCR', value: fcr, type: 'number' },
      {
        label: 'Cost per Kg',
        value: ratio(totals.expense, totals.sale_weight),
        type: 'currency',
      },
    ],
    chart: {
      type: 'bar',
      title: 'Profit by batch',
      x: 'name',
      series: [{ key: 'profit', label: 'Profit' }],
      data: rows.map((row) => ({ name: row.name, profit: row.profit })),
    },
    sections: [
      {
        key: 'batches',
        title: 'Batches',
        columns: COLUMNS,
        rows,
        total: {
          name: 'Total',
          ...totals,
          avg_weight: avgWeight,
          fcr,
          cfcr: totals.sale_weight ? round(fcr - (avgWeight - 2) * 0.25, 3) : 0,
          cost_per_kg: ratio(totals.expense, totals.sale_weight),
          rate_per_kg: ratio(totals.revenue, totals.sale_weight),
        },
      },
    ],
  }
}

export default {
  key: 'batch_financial',
  title: 'Batch Performance (Financial)',
  description:
    'Feed, sales, FCR, expense and profit for each batch, calculated like the Batch Overview.',
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
