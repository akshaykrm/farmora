import seasonService from '@services/season.service'
import asyncHandler from '@utils/async-handler'

const create = async (req, res) => {
  const payload = req.body
  payload.master_id = req.user.id

  const newSeason = await seasonService.create(payload, req.user)
  res.success(newSeason, {
    message: 'Season created successfully',
    statusCode: 201,
  })
}

const getNames = async (req, res) => {
  const filter = {}
  const { status } = req.query

  if (status) {
    filter.status = status
  }

  const records = await seasonService.getNames(req.user, filter)
  res.success(records, { message: 'season names' })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  }

  if (req.query.master_id) {
    filter.master_id = req.query.master_id
  }

  if (req.query.status) {
    filter.status = req.query.status
  }
  if (req.query.name) {
    filter.name = req.query.name
  }

  const seasonRecords = await seasonService.getAll(filter, req.user)
  res.success(seasonRecords, { message: 'Seasons fetched successfully' })
}

const getById = async (req, res) => {
  const { season_id } = req.params
  const seasonRecord = await seasonService.getById(season_id, req.user)
  res.success(seasonRecord, { message: 'Season details fetched successfully' })
}

const updateById = async (req, res) => {
  const { season_id } = req.params
  const packageData = req.body
  await seasonService.updateById(season_id, packageData, req.user)
  res.success(null, { message: 'Season updated successfully' })
}

const close = async (req, res) => {
  const { season_id } = req.params
  await seasonService.close(season_id, req.user)
  res.success(null, { message: 'Season closed successfully' })
}

const deleteById = async (req, res) => {
  const { season_id } = req.params
  await seasonService.deleteById(season_id, req.user)
  res.success(null, { message: 'Season deleted successfully' })
}

const seasonController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deleteById: asyncHandler(deleteById),
  getNames: asyncHandler(getNames),
  close: asyncHandler(close),
}

export default seasonController
