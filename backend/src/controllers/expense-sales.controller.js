import expenseSalesService from '@services/expense-sales.service'
import asyncHandler from '@utils/async-handler'
import { parseGeneralEntryFilter } from '@utils/list-filters'

const create = async (req, res) => {
  const payload = req.body
  const user = req.user

  const newRecord = await expenseSalesService.create(payload, user)
  res.success(newRecord, {
    message: 'Expense sales record created successfully',
  })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    ...parseGeneralEntryFilter(req.query),
  }
  const user = req.user

  const records = await expenseSalesService.getAll(filter, user)
  res.success(records, {
    message: 'Expense sales records retrieved successfully',
  })
}

const getById = async (req, res) => {
  const { id } = req.params
  const user = req.user

  const record = await expenseSalesService.getById(id, user)
  res.success(record, {
    message: 'Expense sales record retrieved successfully',
  })
}

const updateById = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  const user = req.user

  await expenseSalesService.updateById(id, payload, user)
  res.success(null, {
    message: 'Expense sales record updated successfully',
  })
}

const deleteById = async (req, res) => {
  const { id } = req.params
  const user = req.user

  await expenseSalesService.deleteById(id, user)
  res.success(null, {
    message: 'Expense sales record deleted successfully',
    statusCode: 204,
  })
}

const expenseSalesController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deleteById: asyncHandler(deleteById),
}

export default expenseSalesController
