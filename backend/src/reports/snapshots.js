import { Op } from 'sequelize'
import BatchReportSnapshotModel from '@models/batchreportsnapshot'
import BatchModel from '@models/batch'
import SalesModel from '@models/sales'
import PurchaseModel from '@models/purchase'
import PurchaseReturnModel from '@models/purchase-return'
import BatchDailyLogModel from '@models/batchdailylog'
import logger from '@utils/logger'
import {
  computeDailyLogMetrics,
  computeFinancialMetrics,
} from './metrics/batch-metrics.js'

export const SNAPSHOT_KINDS = {
  financial: 'overview',
  dailyLog: 'daily_log',
}

export const getSnapshots = async (batchIds, kind) => {
  if (!batchIds.length) return new Map()
  const rows = await BatchReportSnapshotModel.findAll({
    where: { batch_id: { [Op.in]: batchIds }, kind },
    attributes: ['batch_id', 'data'],
    raw: true,
  })
  return new Map(rows.map((row) => [row.batch_id, row.data]))
}

export const saveSnapshots = async (batches, kind, metrics) => {
  const now = new Date()
  const rows = batches
    .filter((batch) => batch.closed_on && metrics.has(batch.id))
    .map((batch) => ({
      batch_id: batch.id,
      master_id: batch.master_id,
      kind,
      data: metrics.get(batch.id),
      computed_at: now,
    }))
  if (!rows.length) return
  await BatchReportSnapshotModel.bulkCreate(rows, {
    updateOnDuplicate: ['data', 'computed_at', 'updated_at'],
    conflictAttributes: ['batch_id', 'kind'],
  })
}

const COMPUTE = {
  [SNAPSHOT_KINDS.financial]: (batches, masterId) =>
    computeFinancialMetrics(
      batches.map((batch) => batch.id),
      masterId
    ),
  [SNAPSHOT_KINDS.dailyLog]: computeDailyLogMetrics,
}

/**
 * Returns metrics for every batch, reading saved snapshots for closed batches
 * and computing the rest. Closed batches without a snapshot get one saved.
 * `batches` need `id`, `master_id`, `closed_on` and `log_start_date`.
 */
export const metricsFor = async (batches, kind, masterId) => {
  const closedIds = batches.filter((batch) => batch.closed_on).map((b) => b.id)
  const saved = await getSnapshots(closedIds, kind)
  const missing = batches.filter((batch) => !saved.has(batch.id))
  const computed = await COMPUTE[kind](missing, masterId)
  await saveSnapshots(missing, kind, computed)
  return new Map([...saved, ...computed])
}

export const invalidateBatchSnapshot = async (batchIds) => {
  const ids = [...new Set(batchIds.filter(Boolean).map(Number))]
  if (!ids.length) return
  await BatchReportSnapshotModel.destroy({
    where: { batch_id: { [Op.in]: ids } },
  })
}

const refreshClosedBatch = async (batch) => {
  await invalidateBatchSnapshot([batch.id])
  const plain = batch.get({ plain: true })
  await Promise.all(
    Object.values(SNAPSHOT_KINDS).map((kind) =>
      metricsFor([plain], kind, plain.master_id)
    )
  )
}

const batchFieldsOf = (fields) => (instance) =>
  fields.flatMap((field) => [instance.get(field), instance.previous(field)])

const TRACKED = [
  [SalesModel, batchFieldsOf(['batch_id'])],
  [PurchaseModel, batchFieldsOf(['batch_id'])],
  [PurchaseReturnModel, batchFieldsOf(['from_batch', 'to_batch'])],
  [BatchDailyLogModel, batchFieldsOf(['batch_id'])],
]

let registered = false

/**
 * Any change to a batch's sales, purchases, returns or daily logs clears its
 * saved report figures; closing a batch saves them.
 */
export const registerSnapshotHooks = () => {
  if (registered) return
  registered = true

  for (const [model, batchIdsOf] of TRACKED) {
    const clear = (instance, options) => {
      const run = () => invalidateBatchSnapshot(batchIdsOf(instance))
      if (options?.transaction?.afterCommit) {
        options.transaction.afterCommit(run)
        return undefined
      }
      return run()
    }
    model.addHook('afterCreate', 'reportSnapshots', clear)
    model.addHook('afterUpdate', 'reportSnapshots', clear)
    model.addHook('afterDestroy', 'reportSnapshots', clear)
  }

  BatchModel.addHook('afterUpdate', 'reportSnapshots', (batch) => {
    if (!batch.changed('closed_on') || !batch.get('closed_on')) return
    refreshClosedBatch(batch).catch((err) =>
      logger.error(
        { err, batch_id: batch.id },
        'Saving batch report snapshot failed'
      )
    )
  })
}
