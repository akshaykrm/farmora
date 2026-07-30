import integrationService from '@services/itegration-book.service'
import asyncHandler from '@utils/async-handler'

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
  }
  const user = req.user

  if (req.query.farm_id) {
    filter.farm_id = req.query.farm_id
  }
  if (req.query.start_date) {
    filter.start_date = req.query.start_date
  }
  if (req.query.end_date) {
    filter.end_date = req.query.end_date
  }

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
