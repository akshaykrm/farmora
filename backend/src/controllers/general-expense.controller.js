import generalExpenseService from '@services/general-expense.service'
import asyncHandler from '@utils/async-handler'
import { parseGeneralEntryFilter } from '@utils/list-filters'

const create = async (req, res) => {
  const payload = req.body
  const user = req.user

  const newRecord = await generalExpenseService.create(payload, user)
  res.success(newRecord, {
    message: 'General expense record created successfully',
  })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    ...parseGeneralEntryFilter(req.query),
  }
  const user = req.user

  const records = await generalExpenseService.getAll(filter, user)
  res.success(records, {
    message: 'General expense records retrieved successfully',
  })
}

const getById = async (req, res) => {
  const { id } = req.params
  const user = req.user

  const record = await generalExpenseService.getById(id, user)
  res.success(record, {
    message: 'General expense record retrieved successfully',
  })
}

const updateById = async (req, res) => {
  const { id } = req.params
  const payload = req.body
  const user = req.user

  await generalExpenseService.updateById(id, payload, user)
  res.success(null, {
    message: 'General expense record updated successfully',
  })
}

const deleteById = async (req, res) => {
  const { id } = req.params
  const user = req.user

  await generalExpenseService.deleteById(id, user)
  res.success(null, {
    message: 'General expense record deleted successfully',
    statusCode: 204,
  })
}

const generalExpenseController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deleteById: asyncHandler(deleteById),
}

export default generalExpenseController
