import salesService from '@services/sales.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'
import { parseSaleFilter, parseSalesBookFilter } from '@utils/list-filters'

const create = async (req, res) => {
  const payload = req.body

  logger.info({ payload }, 'Create sale request received')
  const newSale = await salesService.create(payload, req.user)

  res.success(newSale, {
    message: 'Sale created successfully',
    statusCode: 201,
  })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    ...parseSaleFilter(req.query),
  }

  logger.debug({ filter }, 'Sales query filter')
  const saleRecords = await salesService.getAll(filter, req.user)
  res.success(saleRecords, {
    message: 'Sales fetched successfully',
  })
}

const getById = async (req, res) => {
  const { sale_id } = req.params
  const saleRecord = await salesService.getById(sale_id, req.user)
  res.success(saleRecord, {
    message: 'Sale details fetched successfully',
  })
}

const updateById = async (req, res) => {
  const { sale_id } = req.params
  const payload = req.body
  logger.info(
    { payload, actor_id: req.user.id },
    'Update sale request received'
  )
  await salesService.updateById(sale_id, payload, req.user)
  res.success(null, { message: 'Sale updated successfully' })
}

const deleteById = async (req, res) => {
  const { sale_id } = req.params
  await salesService.deleteById(sale_id, req.user)
  res.success(null, {
    message: 'Sale deleted successfully',
    statusCode: 204,
  })
}

const getSalesLedger = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    ...parseSalesBookFilter(req.query),
  }

  const ledgerData = await salesService.getSalesLedger(filter, req.user)

  res.success(ledgerData, {
    message: 'Sales ledger fetched successfully',
  })
}

const addSalesBookEntry = async (req, res) => {
  const payload = req.body

  logger.info({ payload }, 'Add sales book entry request received')
  const newEntry = await salesService.addSalesBookEntry(payload, req.user)

  res.success(newEntry, {
    message: 'Sales book entry added successfully',
    statusCode: 201,
  })
}

const salesController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deleteById: asyncHandler(deleteById),
  getSalesLedger: asyncHandler(getSalesLedger),
  addSalesBookEntry: asyncHandler(addSalesBookEntry),
}

export default salesController
