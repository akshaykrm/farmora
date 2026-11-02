import { Op } from 'sequelize'
import dayjs from 'dayjs'
import BatchModel from '@models/batch'
import { BatchNotFoundError, BatchClosedError } from '@errors/batch.errors'
import userRoles from '@utils/user-roles'
import UserModel from '@models/user'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import { calculateOffSet } from '@utils/pagination'
import logger from '@utils/logger'
import { applyTenantMasterId, tenantMasterId } from '@utils/tenant-scope'
import { sequelize } from '@utils/db'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'

const getAllowance = async (currentUser, transaction = null) => {
  const masterId = tenantMasterId(currentUser)
  const used = await BatchModel.count({
    where: { master_id: masterId },
    transaction,
  })
  if (currentUser.user_type === 'admin') {
    return {
      used,
      limit: null,
      remaining: null,
      can_create: true,
      package_name: null,
      subscription_active: true,
    }
  }
  const now = new Date()
  const subscription = await SubscriptionModel.findOne({
    where: {
      user_id: masterId,
      valid_from: { [Op.lte]: now },
      valid_to: { [Op.gt]: now },
    },
    order: [
      ['valid_to', 'DESC'],
      ['id', 'DESC'],
    ],
    include: [{ model: PackageModel, as: 'package', required: true }],
    transaction,
  })
  const limit = subscription ? subscription.package.batch_limit : 0
  return {
    used,
    limit,
    remaining: limit == null ? null : Math.max(0, limit - used),
    can_create: Boolean(subscription && (limit == null || used < limit)),
    package_name: subscription?.package?.name || null,
    subscription_active: Boolean(subscription),
  }
}

const create = async (payload, currentUser, options = {}) => {
  const insert = async (transaction) => {
    const masterId = tenantMasterId(currentUser)
    const owner = await UserModel.findByPk(masterId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!owner)
      throw Object.assign(new Error('Batch owner not found.'), {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      })
    const allowance = await getAllowance(currentUser, transaction)
    if (!allowance.can_create)
      throw Object.assign(
        new Error(
          allowance.subscription_active
            ? `Your package allows ${allowance.limit} total batches. Upgrade your package to add another.`
            : 'An active subscription is required to create a batch.'
        ),
        {
          statusCode: 403,
          code: allowance.subscription_active
            ? 'BATCH_LIMIT_REACHED'
            : 'SUBSCRIPTION_REQUIRED',
          details: allowance,
        }
      )
    const farm = await FarmModel.findOne({
      where: { id: payload.farm_id, master_id: masterId },
      transaction,
    })
    const season = await SeasonModel.findOne({
      where: { id: payload.season_id, master_id: masterId },
      transaction,
    })
    if (!farm || !season)
      throw Object.assign(
        new Error('Farm or season not found in this account.'),
        { statusCode: 404, code: 'BATCH_PARENT_NOT_FOUND' }
      )
    return BatchModel.create(
      { ...payload, name: payload.name.trim(), master_id: masterId },
      { transaction }
    )
  }
  return options.transaction
    ? insert(options.transaction)
    : sequelize.transaction(insert)
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
    attributes: ['id', 'name', 'created_at'],
    limit: 50,
    order: [['created_at', 'DESC']],
  })
  return records
}

const getAll = async (payload, currentUser) => {
  const { page, limit, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }
  applyTenantMasterId(filter, currentUser)
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
    logger.error({ err: error }, 'Error in getAll')
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
    include: [{ model: SeasonModel, as: 'season', attributes: ['id', 'name'] }],
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
  getAllowance,
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
