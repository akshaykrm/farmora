import workingCostService from '@services/working-cost.service'
import asyncHandler from '@utils/async-handler'
import { parseWorkingCostFilter } from '@utils/expense-filters'

const create = async (req, res) => {
  const payload = req.body
  const user = req.user

  const newRecord = await workingCostService.create(payload, user)
  res.success(newRecord, {
    message: 'Working cost record created successfully',
  })
}

const getAll = async (req, res) => {
  const filter = {
    e_page: parseInt(req.query.e_page) || 1,
    e_limit: parseInt(req.query.e_limit) || 10,
    i_page: parseInt(req.query.i_page) || 1,
    i_limit: parseInt(req.query.i_limit) || 10,
    ...parseWorkingCostFilter(req.query),
  }

  const user = req.user

  const records = await workingCostService.getAll(filter, user)
  res.success(records, {
    message: 'Working cost records retrieved successfully',
  })
}

const workingCostController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
}

export default workingCostController
