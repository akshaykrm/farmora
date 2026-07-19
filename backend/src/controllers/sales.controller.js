import salesService from '@services/sales.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'

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
  const filter = {}

  if (req.query.page) {
    filter.page = parseInt(req.query.page)
  }

  if (req.query.limit) {
    filter.limit = parseInt(req.query.limit)
  }

  if (req.query.master_id) {
    filter.master_id = req.query.master_id
  }
  if (req.query.status) {
    filter.status = req.query.status
  }
  if (req.query.season_id) {
    filter.season_id = req.query.season_id
  }
  if (req.query.batch_id) {
    filter.batch_id = req.query.batch_id
  }
  if (req.query.buyer_name) {
    filter.buyer_name = req.query.buyer_name
  }
  if (req.query.payment_type) {
    filter.payment_type = req.query.payment_type
  }
  if (req.query.start_date) {
    filter.start_date = req.query.start_date
  }
  if (req.query.end_date) {
    filter.end_date = req.query.end_date
  }

  console.log(filter)
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
    buyer_id: req.query.buyer_id,
  }

  if (req.query.from_date) {
    filter.from_date = req.query.from_date
  }
  if (req.query.end_date) {
    filter.end_date = req.query.end_date
  }

  logger.info({ filter }, 'Sales ledger request received')
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
