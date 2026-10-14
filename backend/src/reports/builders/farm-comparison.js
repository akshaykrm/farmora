import { schemaOf } from '../filters.js'
import { batchFilterMeta, selectBatches } from '../batches.js'
import { metricsFor, SNAPSHOT_KINDS } from '../snapshots.js'
import { FEED_BAG_KG } from '@utils/feed'
import { num, pct, ratio, round, sumRows } from '../helpers.js'

const COLUMNS = [
  { key: 'farm_name', header: 'Farm', width: 1.3 },
  { key: 'capacity', header: 'Capacity', type: 'number' },
  { key: 'batches', header: 'Batches', type: 'number', width: 0.7 },
  { key: 'chicks_placed', header: 'Chicks', type: 'number' },
  { key: 'capacity_used_pct', header: 'Capacity Used %', type: 'number' },
  { key: 'mortality_pct', header: 'Mort %', type: 'number', width: 0.7 },
  { key: 'sale_weight', header: 'Kg Sold', type: 'number' },
  { key: 'fcr', header: 'FCR', type: 'number', width: 0.6 },
  { key: 'revenue', header: 'Revenue', type: 'currency' },
  { key: 'expense', header: 'Expense', type: 'currency' },
  { key: 'profit', header: 'Profit', type: 'currency' },
  { key: 'profit_per_kg', header: 'Profit/Kg', type: 'currency', width: 0.8 },
]

const build = async (filter, { masterId }) => {
  const batches = await selectBatches(masterId, filter)
  const [financial, dailyLog] = await Promise.all([
    metricsFor(batches, SNAPSHOT_KINDS.financial, masterId),
    metricsFor(batches, SNAPSHOT_KINDS.dailyLog, masterId),
  ])

  const farms = new Map()
  for (const batch of batches) {
    const key = batch.farm_id || 0
    const farm = farms.get(key) || {
      farm_name: batch.farm_name || 'No farm',
      capacity: num(batch.farm_capacity),
      batches: 0,
      chicks_placed: 0,
      mortality: 0,
      net_feed_bags: 0,
      sale_weight: 0,
      revenue: 0,
      expense: 0,
    }
    const money = financial.get(batch.id) || {}
    const log = dailyLog.get(batch.id) || {}
    farm.batches += 1
    farm.chicks_placed += num(money.chicks_placed)
    farm.mortality += num(log.mortality)
    farm.net_feed_bags += num(money.net_feed_bags)
    farm.sale_weight += num(money.sale_weight)
    farm.revenue += num(money.revenue)
    farm.expense += num(money.expense)
    farms.set(key, farm)
  }

  const rows = [...farms.values()].map((farm) => {
    const profit = farm.revenue - farm.expense
    return {
      ...farm,
      sale_weight: round(farm.sale_weight),
      revenue: round(farm.revenue),
      expense: round(farm.expense),
      profit: round(profit),
      capacity_used_pct: farm.capacity
        ? pct(farm.chicks_placed / farm.batches, farm.capacity)
        : 0,
      mortality_pct: pct(farm.mortality, farm.chicks_placed),
      fcr: ratio(farm.net_feed_bags * FEED_BAG_KG, farm.sale_weight, 3),
      profit_per_kg: ratio(profit, farm.sale_weight),
    }
  })

  const totals = sumRows(rows, [
    'batches',
    'chicks_placed',
    'sale_weight',
    'revenue',
    'expense',
    'profit',
  ])

  return {
    meta: await batchFilterMeta(masterId, filter),
    summary: [
      { label: 'Farms', value: rows.length, type: 'number' },
      { label: 'Batches', value: totals.batches, type: 'number' },
      { label: 'Kg Sold', value: totals.sale_weight, type: 'number' },
      { label: 'Profit', value: totals.profit, type: 'currency' },
    ],
    chart: {
      type: 'bar',
      title: 'Profit by farm',
      x: 'farm_name',
      series: [
        { key: 'revenue', label: 'Revenue' },
        { key: 'expense', label: 'Expense' },
        { key: 'profit', label: 'Profit' },
      ],
      data: rows,
    },
    sections: [
      {
        key: 'farms',
        title: 'Farms',
        columns: COLUMNS,
        rows,
        total: {
          farm_name: 'Total',
          ...totals,
          profit_per_kg: ratio(totals.profit, totals.sale_weight),
        },
      },
    ],
  }
}

export default {
  key: 'farm_comparison',
  title: 'Farm Comparison',
  description:
    'Batches, capacity used, mortality, FCR and profit compared across farms.',
  group: 'Production',
  audience: 'tenant',
  schema: schemaOf(
    'season_id',
    'farm_id',
    'batch_status',
    'start_date',
    'end_date'
  ),
  scope: { scopes: ['season_id'] },
  build,
}
