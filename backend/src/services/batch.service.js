import { Op } from 'sequelize'
import dayjs from 'dayjs'
import BatchModel from '@models/batch'
import { BatchNotFoundError, BatchClosedError } from '@errors/batch.errors'
import userRoles from '@utils/user-roles'
import UserModel from '@models/user'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import { calculateOffSet } from '@utils/pagination'

const create = async (payload, currentUser) => {
  payload.name = payload.name.trim()
  payload.master_id = currentUser.id
  const newBatch = await BatchModel.create(payload)
  return newBatch
}

const getNames = async (currentUser, filter) => {
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  if (filter.status === 'active') {
    filter.closed_on = {
      [Op.is]: null,
    }
  }

  const records = await BatchModel.findAll({
    where: filter,
    attributes: ['id', 'name'],
    limit: 50,
  })
  return records
}

const getAll = async (payload, currentUser) => {
  const { page, limit, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }
  try {
    const { count, rows } = await BatchModel.findAndCountAll({
      where: filter,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: UserModel, as: 'master', attributes: ['id', 'name'] },
        { model: FarmModel, as: 'farm', attributes: ['id', 'name'] },
        { model: SeasonModel, as: 'season', attributes: ['id', 'name'] },
      ],
    })

    const totalPages = Math.ceil(count / limit)
    return {
      totalPages,
      data: rows,
    }
  } catch (error) {
    console.error('Error in getAll:', error)
    throw error
  }
}

export async function getAllClosedBatches(filter) {
  const batchRecords = await BatchModel.findAll({
    where: {
      ...filter,
      closed_on: {
        [Op.not]: null,
      },
    },
  })
  return batchRecords
}

export async function getAllActiveBatches(filter) {
  const batchRecords = await BatchModel.findAll({
    where: {
      ...filter,
      closed_on: {
        [Op.is]: null,
      },
    },
  })
  return batchRecords
}

const getById = async (batchId, currentUser, opts = {}) => {
  const { include = [], where } = opts
  let filter = { id: batchId }
  if (where) {
    filter = { ...filter, ...where }
  }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  } else if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  }

  const batchRecord = await BatchModel.findOne({
    where: filter,
    include,
  })

  if (!batchRecord) {
    throw new BatchNotFoundError(batchId)
  }

  return batchRecord
}

const getBySeasonId = async (seasonId, currentUser) => {
  let filter = {
    season_id: seasonId,
    closed_on: {
      [Op.ne]: null,
    },
  }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  } else if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  }

  const batchRecord = await BatchModel.findAll({
    where: filter,
  })

  if (!batchRecord) {
    throw new BatchNotFoundError(seasonId)
  }

  return batchRecord
}

export async function getAllBySeasonId(seasonId, currentUser) {
  let filter = {
    season_id: seasonId,
  }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  } else if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  }

  const batchRecords = await BatchModel.findAll({
    where: filter,
    order: [['id', 'ASC']],
  })

  return batchRecords
}

async function getCount(filter, currentUser) {
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  } else if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  }

  const batchCount = await BatchModel.count({
    where: filter,
  })

  return batchCount || 0
}

const updateById = async (batchId, payload, currentUser) => {
  const batchRecord = await getById(batchId, currentUser)
  await batchRecord.update(payload)
}

const close = async (batchId, currentUser, closingStatement = null) => {
  const batchRecord = await getById(batchId, currentUser)
  const payload = { closed_on: dayjs().toDate() }
  if (closingStatement !== null) {
    payload.closing_statement = closingStatement
  }
  await batchRecord.update(payload)
}

const parseLogs = (value) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // not JSON — fall through to legacy handling
  }
  return [{ log: String(value), created_at: null }]
}

const addLog = async (batchId, currentUser, logText) => {
  const batchRecord = await getById(batchId, currentUser)
  if (batchRecord.closed_on) {
    throw new BatchClosedError()
  }

  const logs = parseLogs(batchRecord.closing_statement)
  logs.push({ log: logText, created_at: new Date().toISOString() })
  await batchRecord.update({ closing_statement: JSON.stringify(logs) })
}

const deleteById = async (batchId, currentUser) => {
  const batchRecord = await getById(batchId, currentUser)
  await batchRecord.destroy()
}

const batchService = {
  create,
  getAll,
  getById,
  getBySeasonId,
  getAllBySeasonId,
  updateById,
  deleteById,
  close,
  addLog,
  getNames,
  getCount,
}

export default batchService
