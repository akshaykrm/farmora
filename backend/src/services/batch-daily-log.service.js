import dayjs from 'dayjs'
import { Op } from 'sequelize'
import batchService from '@services/batch.service'
import BatchDailyLogModel from '@models/batchdailylog'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import VendorModel from '@models/vendor'
import PurchaseModel from '@models/purchase'
import PurchaseReturnModel from '@models/purchase-return'
import ItemModel from '@models/items.model'
import {
  DailyLogBatchClosedError,
  DailyLogDateError,
  DailyLogDuplicateDateError,
  DailyLogNotFoundError,
  DailyLogStartDateMissingError,
} from '@errors/batch-daily-log.errors'
import { CHICK_TYPE, isFeedType } from '@utils/feed'
import logger from '@utils/logger'

const DATE_FORMAT = 'YYYY-MM-DD'

const today = () => dayjs().format(DATE_FORMAT)

const daysBetween = (from, to) => dayjs(to).diff(dayjs(from), 'day')

const round = (value, digits = 2) => {
  const factor = 10 ** digits
  return Math.round((Number(value) || 0) * factor) / factor
}

const toNumber = (value) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const plain = (record) =>
  record && typeof record.toJSON === 'function' ? record.toJSON() : record

const loadBatch = (batchId, currentUser) =>
  batchService.getById(batchId, currentUser, {
    include: [
      { model: FarmModel, as: 'farm', required: false },
      { model: SeasonModel, as: 'season', required: false },
    ],
  })

const assertOpen = (batch) => {
  if (batch.closed_on) {
    throw new DailyLogBatchClosedError()
  }
}

const assertNotFuture = (date, label) => {
  if (date > today()) {
    throw new DailyLogDateError(`${label} cannot be in the future`)
  }
}

const findLogs = (batchId) =>
  BatchDailyLogModel.findAll({
    where: { batch_id: batchId },
    order: [['date', 'ASC']],
  })

/**
 * Chicks placed in a batch are the chick purchases assigned to it, plus chicks
 * moved in from other batches, minus chicks returned or moved out.
 */
const findChickEntries = async (batch) => {
  const chickCategory = {
    model: ItemModel,
    as: 'category',
    required: true,
    attributes: ['id', 'type'],
    where: { type: CHICK_TYPE },
  }

  const [purchases, movedIn, movedOut] = await Promise.all([
    PurchaseModel.findAll({
      where: { batch_id: batch.id, master_id: batch.master_id },
      attributes: ['id', 'quantity', 'invoice_date'],
      include: [
        chickCategory,
        {
          model: VendorModel,
          as: 'vendor',
          required: false,
          attributes: ['id', 'name'],
        },
      ],
    }),
    PurchaseReturnModel.findAll({
      where: { to_batch: batch.id, master_id: batch.master_id },
      attributes: ['id', 'quantity', 'date'],
      include: [chickCategory],
    }),
    PurchaseReturnModel.findAll({
      where: { from_batch: batch.id, master_id: batch.master_id },
      attributes: ['id', 'quantity', 'date'],
      include: [chickCategory],
    }),
  ])

  return [
    ...purchases.map((record) => ({
      date: dayjs(record.invoice_date).format(DATE_FORMAT),
      qty: toNumber(record.quantity),
      company: record.vendor?.name || null,
    })),
    ...movedIn.map((record) => ({
      date: dayjs(record.date).format(DATE_FORMAT),
      qty: toNumber(record.quantity),
      company: null,
    })),
    ...movedOut.map((record) => ({
      date: dayjs(record.date).format(DATE_FORMAT),
      qty: -toNumber(record.quantity),
      company: null,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))
}

const chicksPlacedBy = (chickEntries, date) =>
  chickEntries
    .filter((entry) => entry.date <= date)
    .reduce((sum, entry) => sum + entry.qty, 0)

/**
 * Builds the sheet rows. Age, cumulative values and stock are always derived
 * from the stored daily entries so edits to earlier days ripple forward.
 */
export const computeLogRows = (logs, chickEntries, startDate) => {
  let cumMortality = 0
  let totalIssued = 0
  let totalConsumed = 0

  return logs.map((record) => {
    const log = plain(record)
    const mortality = log.mortality || 0
    const issued = toNumber(log.issued_feed)
    const consumed = toNumber(log.consumed_feed)

    cumMortality += mortality
    totalIssued += issued
    totalConsumed += consumed

    const placed = chicksPlacedBy(chickEntries, log.date)

    return {
      id: log.id,
      date: log.date,
      age: startDate ? daysBetween(startDate, log.date) : null,
      mortality,
      cum_mortality: cumMortality,
      issued_feed: round(issued),
      consumed_feed: round(consumed),
      total_consumption: round(totalConsumed),
      feed_stock: round(totalIssued - totalConsumed),
      total_issued: round(totalIssued),
      chicks_placed: placed,
      birds_alive: placed - cumMortality,
      mortality_pct: placed ? round((cumMortality / placed) * 100) : 0,
      avg_body_weight:
        log.avg_body_weight === null || log.avg_body_weight === undefined
          ? null
          : toNumber(log.avg_body_weight),
      remarks: log.remarks || null,
    }
  })
}

const buildHeader = (batch, chickEntries) => {
  const companies = [
    ...new Set(chickEntries.map((entry) => entry.company).filter(Boolean)),
  ]
  const firstPurchase = chickEntries.find((entry) => entry.qty > 0)
  return {
    farm_name: batch.farm?.name || null,
    place: batch.farm?.place || null,
    batch_name: batch.name,
    season_name: batch.season?.name || null,
    total_chicks: chickEntries.reduce((sum, entry) => sum + entry.qty, 0),
    companies,
    log_start_date: batch.log_start_date || null,
    suggested_start_date: firstPurchase?.date || null,
  }
}

const buildSummary = (rows, header) => {
  const last = rows[rows.length - 1]
  const totalMortality = last?.cum_mortality || 0
  const totalChicks = header.total_chicks
  return {
    total_chicks: totalChicks,
    total_mortality: totalMortality,
    mortality_pct: totalChicks
      ? round((totalMortality / totalChicks) * 100)
      : 0,
    birds_alive: totalChicks - totalMortality,
    total_issued: last?.total_issued || 0,
    total_consumed: last?.total_consumption || 0,
    feed_stock: last?.feed_stock || 0,
    last_age: last?.age ?? null,
    current_age: header.log_start_date
      ? daysBetween(header.log_start_date, today())
      : null,
    log_count: rows.length,
  }
}

const list = async (batchId, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  const [chickEntries, logs] = await Promise.all([
    findChickEntries(batch),
    findLogs(batch.id),
  ])
  const header = buildHeader(batch, chickEntries)
  const rows = computeLogRows(logs, chickEntries, header.log_start_date)

  return {
    batch: {
      id: batch.id,
      name: batch.name,
      status: batch.status,
      closed_on: batch.closed_on,
      log_start_date: batch.log_start_date,
    },
    header,
    logs: rows,
    summary: buildSummary(rows, header),
  }
}

const assertLogDate = (batch, date) => {
  if (!batch.log_start_date) {
    throw new DailyLogStartDateMissingError()
  }
  if (date < batch.log_start_date) {
    throw new DailyLogDateError(
      `Log date cannot be before the start date (${batch.log_start_date})`
    )
  }
  assertNotFuture(date, 'Log date')
}

const assertDateFree = async (batchId, date, exceptId = null) => {
  const where = { batch_id: batchId, date }
  if (exceptId) where.id = { [Op.ne]: exceptId }
  const existing = await BatchDailyLogModel.findOne({ where })
  if (existing) {
    throw new DailyLogDuplicateDateError(date)
  }
}

const findLog = async (batchId, logId) => {
  const record = await BatchDailyLogModel.findOne({
    where: { id: logId, batch_id: batchId },
  })
  if (!record) throw new DailyLogNotFoundError(logId)
  return record
}

const create = async (batchId, payload, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  assertOpen(batch)
  assertLogDate(batch, payload.date)
  await assertDateFree(batch.id, payload.date)

  const record = await BatchDailyLogModel.create({
    ...payload,
    batch_id: batch.id,
    master_id: batch.master_id,
    created_by: currentUser.id,
  })
  logger.info(
    { batch_id: batch.id, log_id: record.id, date: payload.date },
    'Batch daily log created'
  )
  return record
}

const update = async (batchId, logId, payload, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  assertOpen(batch)
  const record = await findLog(batch.id, logId)

  if (payload.date && payload.date !== record.date) {
    assertLogDate(batch, payload.date)
    await assertDateFree(batch.id, payload.date, record.id)
  }

  await record.update(payload)
  return record
}

const remove = async (batchId, logId, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  assertOpen(batch)
  const record = await findLog(batch.id, logId)
  await record.destroy()
}

const sumFeedQuantity = (records) =>
  records
    .filter((record) => isFeedType(record.category?.type))
    .reduce((sum, record) => sum + toNumber(record.quantity), 0)

const prefill = async (batchId, date, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  const start = dayjs(date).startOf('day').toDate()
  const end = dayjs(date).add(1, 'day').startOf('day').toDate()
  const categoryInclude = {
    model: ItemModel,
    as: 'category',
    required: false,
    attributes: ['id', 'type'],
  }

  const [purchases, reassigned] = await Promise.all([
    PurchaseModel.findAll({
      where: {
        batch_id: batch.id,
        master_id: batch.master_id,
        invoice_date: { [Op.gte]: start, [Op.lt]: end },
      },
      attributes: ['id', 'quantity'],
      include: [categoryInclude],
    }),
    PurchaseReturnModel.findAll({
      where: {
        to_batch: batch.id,
        master_id: batch.master_id,
        date: { [Op.gte]: start, [Op.lt]: end },
      },
      attributes: ['id', 'quantity'],
      include: [categoryInclude],
    }),
  ])

  return {
    date,
    age: batch.log_start_date ? daysBetween(batch.log_start_date, date) : null,
    issued_feed: round(
      sumFeedQuantity(purchases) + sumFeedQuantity(reassigned)
    ),
  }
}

const setStartDate = async (batchId, startDate, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  assertOpen(batch)
  assertNotFuture(startDate, 'Start date')

  const firstLog = await BatchDailyLogModel.findOne({
    where: { batch_id: batch.id },
    order: [['date', 'ASC']],
  })
  if (firstLog && firstLog.date < startDate) {
    throw new DailyLogDateError(
      `Start date cannot be after the first daily log (${firstLog.date})`
    )
  }

  await batch.update({ log_start_date: startDate })
  return { log_start_date: startDate }
}

const batchDailyLogService = {
  list,
  create,
  update,
  remove,
  prefill,
  setStartDate,
}

export default batchDailyLogService
