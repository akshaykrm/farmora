import { FarmNotFoundError } from '@errors/farm.errors'
import FarmModel from '@models/farm'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import { sequelize } from '@utils/db'
import { Op } from 'sequelize'
import { calculateOffSet } from '@utils/pagination'
import { applyTenantMasterId, tenantMasterId } from '@utils/tenant-scope'

const getAllowance = async (currentUser, transaction = null) => {
  const masterId = tenantMasterId(currentUser)
  const used = await FarmModel.count({
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
  const limit = subscription ? subscription.package.farm_limit : 0
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
    // Every creation path locks the same owner, including staff and setup.
    const owner = await UserModel.findByPk(masterId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!owner)
      throw Object.assign(new Error('Farm owner not found'), {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      })
    const allowance = await getAllowance(currentUser, transaction)
    if (!allowance.can_create) {
      throw Object.assign(
        new Error(
          allowance.subscription_active
            ? `Your package allows ${allowance.limit} farms. Upgrade your package to add another farm.`
            : 'An active subscription is required to create a farm.'
        ),
        {
          statusCode: 403,
          code: allowance.subscription_active
            ? 'FARM_LIMIT_REACHED'
            : 'SUBSCRIPTION_REQUIRED',
          details: allowance,
        }
      )
    }
    return FarmModel.create(
      { ...payload, master_id: masterId, own: true, status: 'active' },
      { transaction }
    )
  }
  return options.transaction
    ? insert(options.transaction)
    : sequelize.transaction(insert)
}

const getNames = async (currentUser) => {
  const filter = {}
  applyTenantMasterId(filter, currentUser)

  const records = await FarmModel.findAll({
    where: filter,
    attributes: ['id', 'name'],
    limit: 50,
  })
  return records
}

const getAll = async (payload = {}, currentUser) => {
  const { page, limit, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  applyTenantMasterId(filter, currentUser)

  const { rows, count } = await FarmModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  const totalPages = Math.ceil(count / limit)
  return {
    totalPages: totalPages,
    data: rows,
  }
}

const getById = async (farmId, currentUser) => {
  const filter = { id: farmId }
  applyTenantMasterId(filter, currentUser)

  const farmRecord = await FarmModel.findOne({ where: filter })
  if (!farmRecord) {
    throw new FarmNotFoundError(farmId)
  }

  return farmRecord
}

const updateById = async (farmId, payload, currentUser) => {
  const farmRecord = await getById(farmId, currentUser)
  await farmRecord.update(payload)
}

const deleteById = async (farmId, currentUser) => {
  const farmRecord = await getById(farmId, currentUser)
  await farmRecord.destroy()
}

const farmService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
  getNames,
  getAllowance,
}

export default farmService
