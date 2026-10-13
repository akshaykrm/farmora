import integrationService from '@services/itegration-book.service'
import asyncHandler from '@utils/async-handler'
import { parseIntegrationBookFilter } from '@utils/expense-filters'

const create = async (req, res) => {
  const payload = req.body
  const user = req.user

  const newRecord = await integrationService.create(payload, user)
  res.success(newRecord, {
    message: 'Integration book record created successfully',
  })
}

const getAll = async (req, res) => {
  const filter = {
    c_page: parseInt(req.query.c_page) || 1,
    c_limit: parseInt(req.query.c_limit) || 10,
    p_page: parseInt(req.query.p_page) || 1,
    p_limit: parseInt(req.query.p_limit) || 10,
    ...parseIntegrationBookFilter(req.query),
  }
  const user = req.user

  const records = await integrationService.getAll(filter, user)
  res.success(records, {
    message: 'Integration book records retrieved successfully',
  })
}

const integrationBookController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
}

export default integrationBookController
