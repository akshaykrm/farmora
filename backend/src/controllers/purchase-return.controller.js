import purchaseReturnService from '@services/purchase-return.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'
import CONFIG from '../../config.js'
import { parseItemReturnFilter } from '@utils/expense-filters'

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
    ...parseItemReturnFilter(req.query),
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
