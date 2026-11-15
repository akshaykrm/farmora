import { schemaOf } from '../filters.js'
import { batchFilterMeta, selectBatches } from '../batches.js'
import { metricsFor, SNAPSHOT_KINDS } from '../snapshots.js'
import {
  calculateBirdShortage,
  computeShortageMetrics,
} from '../metrics/batch-metrics.js'
import { FEED_BAG_KG } from '@utils/feed'
import { num, ratio, round } from '../helpers.js'

const SHORTAGE_COLUMNS = [
  { key: 'total_birds_purchased', header: 'Birds Purchased', type: 'number' },
  { key: 'sale_birds', header: 'Birds Sold', type: 'number' },
  { key: 'total_mortality', header: 'Mortality', type: 'number' },
  { key: 'bird_shortage', header: 'Shortage', type: 'number' },
  { key: 'shortage_percentage', header: 'Shortage %', type: 'number' },
]

const PERFORMANCE_COLUMNS = [
  { key: 'avg_weight', header: 'Avg Wt', type: 'number', width: 0.7 },
  { key: 'fcr', header: 'FCR', type: 'number', width: 0.7 },
  { key: 'cfcr', header: 'CFCR', type: 'number', width: 0.7 },
  { key: 'profit', header: 'Profit', type: 'currency' },
  { key: 'cost_per_kg', header: 'Cost/Kg', type: 'currency', width: 0.8 },
]

const BATCH_COLUMNS = [
  { key: 'rank', header: 'Rank', type: 'number', width: 0.5 },
  { key: 'name', header: 'Batch', width: 1.3 },
  { key: 'farm_name', header: 'Farm' },
  { key: 'season_name', header: 'Season' },
  { key: 'status', header: 'Status', width: 0.7 },
  ...SHORTAGE_COLUMNS,
  ...PERFORMANCE_COLUMNS,
]

const FARM_COLUMNS = [
  { key: 'rank', header: 'Rank', type: 'number', width: 0.5 },
  { key: 'farm_name', header: 'Farm', width: 1.3 },
  { key: 'batches', header: 'Batches', type: 'number', width: 0.7 },
  ...SHORTAGE_COLUMNS,
  ...PERFORMANCE_COLUMNS,
]

const shortageRow = (purchased, sold, dead) => {
  const result = calculateBirdShortage(purchased, sold, dead)
  return {
    ...result,
    sale_birds: sold,
    shortage_percentage: round(result.shortage_percentage),
  }
}

const performanceRow = ({
  feedKg,
  saleWeight,
  saleBirds,
  revenue,
  expense,
}) => {
  const avgWeight = ratio(saleWeight, saleBirds, 3)
  const fcr = ratio(feedKg, saleWeight, 3)
  return {
    avg_weight: avgWeight,
    fcr,
    cfcr: saleWeight ? round(fcr - (avgWeight - 2) * 0.25, 3) : 0,
    profit: round(revenue - expense),
    cost_per_kg: ratio(expense, saleWeight),
  }
}

/** Lowest shortage % first. Rows without purchased birds go last, unranked. */
const rankByShortage = (rows) => {
  const ranked = rows
    .filter((row) => row.total_birds_purchased > 0)
    .sort((a, b) => a.shortage_percentage - b.shortage_percentage)
  const unranked = rows.filter((row) => row.total_birds_purchased <= 0)
  return [
    ...ranked.map((row, index) => ({ ...row, rank: index + 1 })),
    ...unranked.map((row) => ({ ...row, rank: null })),
  ]
}

const build = async (filter, { masterId }) => {
  const batches = await selectBatches(masterId, filter)
  const [shortage, financial] = await Promise.all([
    computeShortageMetrics(batches, masterId),
    metricsFor(batches, SNAPSHOT_KINDS.financial, masterId),
  ])

  const unranked = batches.map((batch) => {
    const s = shortage.get(batch.id)
    const f = financial.get(batch.id) || {}
    return {
      id: batch.id,
      name: batch.name,
      farm_name: batch.farm_name || 'No farm',
      season_name: batch.season_name,
      status: batch.closed_on ? 'Closed' : 'Open',
      ...shortageRow(s.total_birds_purchased, s.sale_birds, s.total_mortality),
      ...performanceRow({
        feedKg: num(f.net_feed_kg),
        saleWeight: num(f.sale_weight),
        saleBirds: num(f.sale_birds),
        revenue: num(f.revenue),
        expense: num(f.expense),
      }),
      _feed_kg: num(f.net_feed_kg),
      _sale_weight: num(f.sale_weight),
      _revenue: num(f.revenue),
      _expense: num(f.expense),
    }
  })
  const batchRows = rankByShortage(unranked)

  // Farm figures are built from summed counts, not averaged percentages.
  const sumOf = (rows, key) => rows.reduce((acc, row) => acc + num(row[key]), 0)
  const groupFigures = (rows) => ({
    ...shortageRow(
      sumOf(rows, 'total_birds_purchased'),
      sumOf(rows, 'sale_birds'),
      sumOf(rows, 'total_mortality')
    ),
    ...performanceRow({
      feedKg: sumOf(rows, '_feed_kg'),
      saleWeight: sumOf(rows, '_sale_weight'),
      saleBirds: sumOf(rows, 'sale_birds'),
      revenue: sumOf(rows, '_revenue'),
      expense: sumOf(rows, '_expense'),
    }),
  })

  const byFarm = new Map()
  for (const row of unranked) {
    byFarm.set(row.farm_name, [...(byFarm.get(row.farm_name) || []), row])
  }
  const farmRows = rankByShortage(
    [...byFarm.entries()].map(([farm_name, rows]) => ({
      farm_name,
      batches: rows.length,
      ...groupFigures(rows),
    }))
  )
  const totals = groupFigures(unranked)

  const clean = ({ _feed_kg, _sale_weight, _revenue, _expense, ...row }) => row
  const rankedBatches = batchRows.filter((row) => row.rank)
  const best = rankedBatches[0]
  const worst = rankedBatches[rankedBatches.length - 1]
  const bestFarm = farmRows.find((row) => row.rank === 1)
  const label = (row, name) =>
    row ? `${row[name]} (${row.shortage_percentage}%)` : '-'

  return {
    meta: await batchFilterMeta(masterId, filter),
    summary: [
      {
        label: 'Overall Shortage %',
        value: totals.shortage_percentage,
        type: 'number',
      },
      {
        label: 'Overall Shortage',
        value: totals.bird_shortage,
        type: 'number',
      },
      { label: 'Lowest Shortage Batch', value: label(best, 'name') },
      {
        label: 'Highest Shortage Batch',
        value: rankedBatches.length > 1 ? label(worst, 'name') : '-',
      },
      { label: 'Lowest Shortage Farm', value: label(bestFarm, 'farm_name') },
    ],
    chart: {
      type: 'bar',
      title: 'Shortage % by batch (lowest first)',
      x: 'name',
      series: [{ key: 'shortage_percentage', label: 'Shortage %' }],
      data: rankedBatches.map((row) => ({
        name: row.name,
        shortage_percentage: row.shortage_percentage,
      })),
    },
    sections: [
      {
        key: 'farms',
        title: 'Farm comparison (lowest shortage first)',
        columns: FARM_COLUMNS,
        rows: farmRows,
        total: { farm_name: 'Total', batches: batchRows.length, ...totals },
      },
      {
        key: 'batches',
        title: 'Batch comparison (lowest shortage first)',
        columns: BATCH_COLUMNS,
        rows: batchRows.map(clean),
        total: { name: 'Total', ...totals },
      },
    ],
  }
}

export default {
  key: 'bird_shortage',
  title: 'Shortage Comparison (Farm & Batch)',
  description:
    'Ranks farms and batches by bird shortage (purchased - sold - dead), lowest first, with FCR, average weight and profit alongside.',
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
