import dayjs from 'dayjs'
import { Op } from 'sequelize'
import batchService from '@services/batch.service'
import BatchDailyLogModel from '@models/batchdailylog'
import BatchModel from '@models/batch'
import { applyTenantMasterId } from '@utils/tenant-scope'
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

const ageOn = (startDate, date) => daysBetween(startDate, date) + 1

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

const avgWeight = (birds, weight) => (birds ? round(weight / birds, 3) : 0)

/**
 * Builds the sheet rows. Age, cumulative values and stock are always derived
 * from the stored daily entries so edits to earlier days ripple forward.
 */
export const computeLogRows = (logs, chickEntries, startDate) => {
  let cumMortality = 0
  let totalIssued = 0
  let totalConsumed = 0
  let cumSoldBirds = 0
  let cumSoldWeight = 0

  return logs.map((record) => {
    const log = plain(record)
    const mortality = log.mortality || 0
    const issued = toNumber(log.issued_feed)
    const consumed = toNumber(log.consumed_feed)
    const soldBirds = log.sold_birds || 0
    const soldWeight = toNumber(log.sold_weight)

    cumMortality += mortality
    totalIssued += issued
    totalConsumed += consumed
    cumSoldBirds += soldBirds
    cumSoldWeight += soldWeight

    const placed = chicksPlacedBy(chickEntries, log.date)

    return {
      id: log.id,
      date: log.date,
      age: startDate ? ageOn(startDate, log.date) : null,
      mortality,
      cum_mortality: cumMortality,
      issued_feed: round(issued),
      consumed_feed: round(consumed),
      total_consumption: round(totalConsumed),
      feed_stock: round(totalIssued - totalConsumed),
      total_issued: round(totalIssued),
      sold_birds: soldBirds,
      sold_weight: round(soldWeight),
      cum_sold_birds: cumSoldBirds,
      cum_sold_weight: round(cumSoldWeight),
      chicks_placed: placed,
      birds_alive: placed - cumMortality - cumSoldBirds,
      mortality_pct: placed ? round((cumMortality / placed) * 100) : 0,
      avg_body_weight:
        log.avg_body_weight === null || log.avg_body_weight === undefined
          ? null
          : toNumber(log.avg_body_weight),
      remarks: log.remarks || null,
    }
  })
}

/**
 * The manually set start date wins; otherwise the sheet starts on the first
 * chick purchase for the batch.
 */
const startDateFrom = (batch, chickEntries) => {
  const defaultDate = chickEntries.find((entry) => entry.qty > 0)?.date || null
  if (batch.log_start_date) {
    return { date: batch.log_start_date, source: 'manual', defaultDate }
  }
  return {
    date: defaultDate,
    source: defaultDate ? 'chick_purchase' : null,
    defaultDate,
  }
}

const resolveStartDate = async (batch) =>
  startDateFrom(batch, await findChickEntries(batch))

const buildHeader = (batch, chickEntries) => {
  const companies = [
    ...new Set(chickEntries.map((entry) => entry.company).filter(Boolean)),
  ]
  const startDate = startDateFrom(batch, chickEntries)
  return {
    farm_name: batch.farm?.name || null,
    place: batch.farm?.place || null,
    batch_name: batch.name,
    season_name: batch.season?.name || null,
    total_chicks: chickEntries.reduce((sum, entry) => sum + entry.qty, 0),
    companies,
    log_start_date: startDate.date,
    start_date_source: startDate.source,
    default_start_date: startDate.defaultDate,
  }
}

const buildSummary = (rows, header) => {
  const last = rows[rows.length - 1]
  const totalMortality = last?.cum_mortality || 0
  const totalChicks = header.total_chicks
  const soldBirds = last?.cum_sold_birds || 0
  const soldWeight = last?.cum_sold_weight || 0
  return {
    total_chicks: totalChicks,
    total_mortality: totalMortality,
    mortality_pct: totalChicks
      ? round((totalMortality / totalChicks) * 100)
      : 0,
    birds_alive: totalChicks - totalMortality - soldBirds,
    total_sold_birds: soldBirds,
    total_sold_weight: soldWeight,
    avg_sale_weight: avgWeight(soldBirds, soldWeight),
    sold_pct: totalChicks ? round((soldBirds / totalChicks) * 100) : 0,
    total_issued: last?.total_issued || 0,
    total_consumed: last?.total_consumption || 0,
    feed_stock: last?.feed_stock || 0,
    last_age: last?.age ?? null,
    current_age: header.log_start_date
      ? ageOn(header.log_start_date, today())
      : null,
    log_count: rows.length,
  }
}

const buildBatchLog = async (batch) => {
  const [chickEntries, logs] = await Promise.all([
    findChickEntries(batch),
    findLogs(batch.id),
  ])
  const header = buildHeader(batch, chickEntries)
  const rows = computeLogRows(logs, chickEntries, header.log_start_date)
  return { header, rows, summary: buildSummary(rows, header) }
}

const list = async (batchId, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  const { header, rows, summary } = await buildBatchLog(batch)

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
    summary,
  }
}

const countMissedDays = (rows, startDate) => {
  const todayDate = today()
  if (!startDate || startDate >= todayDate) return 0
  const loggedBeforeToday = rows.filter(
    (row) => row.date >= startDate && row.date < todayDate
  ).length
  return Math.max(0, daysBetween(startDate, todayDate) - loggedBeforeToday)
}

const openBatchesStatus = async (currentUser) => {
  const batches = await BatchModel.findAll({
    where: applyTenantMasterId({ closed_on: { [Op.is]: null } }, currentUser),
    include: [
      { model: FarmModel, as: 'farm', required: false },
      { model: SeasonModel, as: 'season', required: false },
    ],
    order: [['name', 'ASC']],
  })

  const todayDate = today()
  return Promise.all(
    batches.map(async (batch) => {
      const { header, rows, summary } = await buildBatchLog(batch)
      const todayRow = rows.find((row) => row.date === todayDate)
      return {
        id: batch.id,
        name: batch.name,
        season_id: batch.season?.id ?? batch.season_id ?? null,
        season_name: batch.season?.name || null,
        farm_name: batch.farm?.name || null,
        log_start_date: header.log_start_date,
        current_age: summary.current_age,
        total_chicks: summary.total_chicks,
        birds_alive: summary.birds_alive,
        total_mortality: summary.total_mortality,
        mortality_pct: summary.mortality_pct,
        feed_stock: summary.feed_stock,
        last_log_date: rows[rows.length - 1]?.date || null,
        today: todayRow
          ? {
              mortality: todayRow.mortality,
              consumed_feed: todayRow.consumed_feed,
            }
          : null,
        missed_days: countMissedDays(rows, header.log_start_date),
      }
    })
  )
}

const assertLogDate = async (batch, date) => {
  const { date: startDate } = await resolveStartDate(batch)
  if (!startDate) {
    throw new DailyLogStartDateMissingError()
  }
  if (date < startDate) {
    throw new DailyLogDateError(
      `Log date cannot be before the start date (${startDate})`
    )
  }
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
  await assertLogDate(batch, payload.date)
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
    await assertLogDate(batch, payload.date)
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

  const [purchases, reassigned, startDate] = await Promise.all([
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
    resolveStartDate(batch),
  ])

  return {
    date,
    age: startDate.date ? ageOn(startDate.date, date) : null,
    issued_feed: round(
      sumFeedQuantity(purchases) + sumFeedQuantity(reassigned)
    ),
  }
}

/**
 * Sets the manual start date. Passing null clears it so the sheet falls back
 * to the first chick purchase date.
 */
const setStartDate = async (batchId, startDate, currentUser) => {
  const batch = await loadBatch(batchId, currentUser)
  assertOpen(batch)
  if (startDate) assertNotFuture(startDate, 'Start date')

  const { defaultDate } = await resolveStartDate(batch)
  const effectiveDate = startDate || defaultDate

  const firstLog = await BatchDailyLogModel.findOne({
    where: { batch_id: batch.id },
    order: [['date', 'ASC']],
  })
  if (firstLog && !effectiveDate) {
    throw new DailyLogDateError(
      'There is no chick purchase to use as the start date'
    )
  }
  if (firstLog && firstLog.date < effectiveDate) {
    throw new DailyLogDateError(
      `Start date cannot be after the first daily log (${firstLog.date})`
    )
  }

  await batch.update({ log_start_date: startDate || null })
  return {
    log_start_date: effectiveDate,
    start_date_source: startDate
      ? 'manual'
      : effectiveDate
        ? 'chick_purchase'
        : null,
  }
}

const batchDailyLogService = {
  list,
  create,
  update,
  remove,
  prefill,
  setStartDate,
  openBatchesStatus,
}

export default batchDailyLogService
