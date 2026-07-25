import purchaseReturnService from '@services/purchase-return.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'
import CONFIG from '../../config/config.js'

const create = async (req, res) => {
  const payload = req.body

  logger.info({ payload }, 'Create item return request received')
  const newItemReturn = await purchaseReturnService.create(payload, req.user)

  res.success(newItemReturn, {
    message: 'Item return created successfully',
    statusCode: 201,
  })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || CONFIG.default_page,
    limit: parseInt(req.query.limit) || CONFIG.default_limit,
  }

  if (req.query.return_type) {
    filter.return_type = req.query.return_type
  }

  if (req.query.item_category_id) {
    filter.item_category_id = req.query.item_category_id
  }

  if (req.query.from_batch) {
    filter.from_batch = req.query.from_batch
  }

  if (req.query.to_batch) {
    filter.to_batch = req.query.to_batch
  }

  if (req.query.to_vendor) {
    filter.to_vendor = req.query.to_vendor
  }

  if (req.query.start_date) {
    filter.start_date = req.query.start_date
  }
  if (req.query.end_date) {
    filter.end_date = req.query.end_date
  }

  const itemReturnRecords = await purchaseReturnService.getAll(filter, req.user)
  res.success(itemReturnRecords, {
    message: 'Item returns fetched successfully',
  })
}

const getById = async (req, res) => {
  const { item_return_id } = req.params
  const itemReturnRecord = await purchaseReturnService.getById(
    item_return_id,
    req.user
  )
  res.success(itemReturnRecord, {
    message: 'Item return details fetched successfully',
  })
}

const updateById = async (req, res) => {
  const { item_return_id } = req.params
  const payload = req.body
  logger.info(
    { payload, actor_id: req.user.id },
    'Update item return request received'
  )
  await purchaseReturnService.updateById(item_return_id, payload, req.user)
  res.success(null, { message: 'Item return updated successfully' })
}

const deleteById = async (req, res) => {
  const { item_return_id } = req.params
  await purchaseReturnService.deleteById(item_return_id, req.user)
  res.success(null, {
    message: 'Item return deleted successfully',
    statusCode: 204,
  })
}

const purchaseReturnController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deleteById: asyncHandler(deleteById),
}

export default purchaseReturnController
