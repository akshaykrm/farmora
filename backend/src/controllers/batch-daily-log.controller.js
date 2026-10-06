import batchDailyLogService from '@services/batch-daily-log.service'
import overviewExportService from '@services/exports/overview-export.service'
import asyncHandler from '@utils/async-handler'
import exportHandler from '@utils/export/export-handler'

const list = async (req, res) => {
  const data = await batchDailyLogService.list(req.params.batch_id, req.user)
  res.success(data, { message: 'Daily log fetched successfully' })
}

const prefill = async (req, res) => {
  const data = await batchDailyLogService.prefill(
    req.params.batch_id,
    req.query.date,
    req.user
  )
  res.success(data, { message: 'Daily log prefill fetched successfully' })
}

const create = async (req, res) => {
  const record = await batchDailyLogService.create(
    req.params.batch_id,
    req.body,
    req.user
  )
  res.success(record, {
    message: 'Daily log added successfully',
    statusCode: 201,
  })
}

const update = async (req, res) => {
  const record = await batchDailyLogService.update(
    req.params.batch_id,
    req.params.id,
    req.body,
    req.user
  )
  res.success(record, { message: 'Daily log updated successfully' })
}

const remove = async (req, res) => {
  await batchDailyLogService.remove(
    req.params.batch_id,
    req.params.id,
    req.user
  )
  res.success(null, { message: 'Daily log deleted successfully' })
}

const setStartDate = async (req, res) => {
  const data = await batchDailyLogService.setStartDate(
    req.params.batch_id,
    req.body.log_start_date,
    req.user
  )
  res.success(data, { message: 'Start date updated successfully' })
}

const batchDailyLogController = {
  list: asyncHandler(list),
  prefill: asyncHandler(prefill),
  create: asyncHandler(create),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
  setStartDate: asyncHandler(setStartDate),
  export: exportHandler(
    (query, req) => ({ batch_id: req.params.batch_id }),
    overviewExportService.dailyLog
  ),
}

export default batchDailyLogController
