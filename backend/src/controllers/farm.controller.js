import farmService from '@services/farm.service'
import asyncHandler from '@utils/async-handler'

const create = async (req, res) => {
  const newFarm = await farmService.create(req.body, req.user)

  res.success(newFarm, {
    message: 'Farm created successfully',
    statusCode: 201,
  })
}

const getNames = async (req, res) => {
  const records = await farmService.getNames(req.user)
  res.success(records, { message: 'farm names' })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
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

  const farmRecords = await farmService.getAll(filter, req.user)
  res.success(farmRecords, { message: 'Farms fetched successfully' })
}

const getById = async (req, res) => {
  const { farm_id } = req.params

  const farmRecord = await farmService.getById(farm_id, req.user)
  res.success(farmRecord, { message: 'Farm details fetched successfully' })
}

const updateById = async (req, res) => {
  const { farm_id } = req.params

  await farmService.updateById(farm_id, req.body, req.user)
  res.success(null, { message: 'Farm updated successfully' })
}

const deletById = async (req, res) => {
  const { farm_id } = req.params

  await farmService.deleteById(farm_id, req.user)
  res.success(null, { message: 'Farm deleted successfully' })
}

const farmController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deletById: asyncHandler(deletById),
  getNames: asyncHandler(getNames),
  getAllowance: asyncHandler(async (req, res) =>
    res.success(await farmService.getAllowance(req.user))
  ),
}

export default farmController
