import batchService from '@services/batch.service'
import asyncHandler from '@utils/async-handler'

const create = async (req, res) => {
  const newBatch = await batchService.create(req.body, req.user)
  res.success(newBatch, {
    message: 'Batch created successfully',
    statusCode: 201,
  })
}

const getNames = async (req, res) => {
  const { season_id, status } = req.query

  const filter = {}

  if (season_id) {
    filter.season_id = season_id
  }

  if (status) {
    filter.status = status
  }

  const records = await batchService.getNames(req.user, filter)

  res.success(records, { message: 'batch names' })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  }

  if (req.query.season_id) {
    filter.season_id = req.query.season_id
  }

  if (req.query.farm_id) {
    filter.farm_id = req.query.farm_id
  }

  if (req.query.status) {
    filter.status = req.query.status
  }

  if (req.query.name) {
    filter.name = req.query.name
  }

  if (req.query.master_id) {
    filter.master_id = req.query.master_id
  }

  const batchRecords = await batchService.getAll(filter, req.user)
  res.success(batchRecords, { message: 'Batches fetched successfully' })
}

const getById = async (req, res) => {
  const { batch_id } = req.params
  const batchRecord = await batchService.getById(batch_id, req.user)
  res.success(batchRecord, { message: 'Batch details fetched successfully' })
}

const updateBatch = async (req, res) => {
  const { batch_id } = req.params
  const payload = req.body
  await batchService.updateById(batch_id, payload, req.user)
  res.success(null, { message: 'Batch updated successfully' })
}

const close = async (req, res) => {
  const { batch_id } = req.params
  const { closing_statement } = req.body
  await batchService.close(batch_id, req.user, closing_statement)
  res.success(null, { message: 'Batch closed successfully' })
}

const deleteById = async (req, res) => {
  const { batch_id } = req.params
  await batchService.deleteById(batch_id, req.user)
  res.success(null, { message: 'Batch deleted successfully', statusCode: 204 })
}

const batchController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateBatch),
  deleteById: asyncHandler(deleteById),
  getNames: asyncHandler(getNames),
  close: asyncHandler(close),
}

export default batchController
