import { Op } from 'sequelize'
import PackageModel from '@models/package'
import RoleModel from '@models/role'
import SubscriptionModel from '@models/subscription'
import CheckoutOrder from '@models/checkoutorder'
import UserModel from '@models/user'
import { sequelize } from '@utils/db'
import { PackageNotFoundError } from '@errors/package.errors'
import { PermissionDeniedError } from '@errors/auth.errors'
import { calculateOffSet } from '@utils/pagination'

const roleInclude = {
  model: RoleModel,
  as: 'role',
  required: false,
  attributes: ['id', 'name', 'description', 'kind'],
}

const assertSystemRoleId = async (roleId) => {
  if (roleId == null || roleId === '') return null

  const role = await RoleModel.findOne({
    where: { id: roleId, kind: 'system' },
  })
  if (!role) {
    throw new PermissionDeniedError('role_id must reference a system role')
  }
  return role.id
}

const create = async (insertData) => {
  const payload = { ...insertData }
  if (Object.prototype.hasOwnProperty.call(payload, 'role_id')) {
    payload.role_id = await assertSystemRoleId(payload.role_id)
  }
  return await PackageModel.create(payload)
}

const getAll = async (payload) => {
  const { limit, page, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  const { count, rows } = await PackageModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
    include: [roleInclude],
  })

  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    data: rows,
  }
}

const getById = async (id) => {
  const packageRecord = await PackageModel.findOne({
    where: { id },
    include: [roleInclude],
  })
  if (!packageRecord) {
    throw new PackageNotFoundError(id)
  }
  return packageRecord
}

const updateById = async (id, data) => {
  const packageRecord = await getById(id)
  const payload = { ...data }
  if (Object.prototype.hasOwnProperty.call(payload, 'role_id')) {
    payload.role_id = await assertSystemRoleId(payload.role_id)
  }
  await packageRecord.update(payload)
}

const deleteById = async (id) => {
  await sequelize.transaction(async (transaction) => {
    const packageRecord = await PackageModel.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!packageRecord) throw new PackageNotFoundError(id)
    const conflict = (message) =>
      Object.assign(new Error(message), {
        code: 'PACKAGE_IN_USE',
        statusCode: 409,
      })
    if (packageRecord.name.trim().toLowerCase() === 'basic') {
      throw conflict(
        'The Basic package is required for default signup and cannot be deleted. You can edit it instead.'
      )
    }
    const subscriptions = await SubscriptionModel.count({
      where: { package_id: id },
      paranoid: false,
      transaction,
    })
    const checkouts = await CheckoutOrder.count({
      where: { package_id: id },
      transaction,
    })
    const requests = await UserModel.count({
      where: { requested_package_id: id },
      transaction,
    })
    if (subscriptions || checkouts || requests) {
      throw conflict(
        'This package is linked to subscribers or checkout orders. Set its status to inactive to stop new purchases.'
      )
    }
    await packageRecord.destroy({ transaction })
  })
}

const getNames = async () => {
  const records = await PackageModel.findAll({
    where: { status: 'active' },
    attributes: ['id', 'name'],
    order: [['id', 'DESC']],
  })
  return records
}

const packageService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
  getNames,
}

export default packageService
