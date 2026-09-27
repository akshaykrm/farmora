import { Op } from 'sequelize'
import PackageModel from '@models/package'
import RoleModel from '@models/role'
import { PackageNotFoundError } from '@errors/package.errors'
import { PermissionDeniedError } from '@errors/auth.errors'

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
  const offset = (page - 1) * limit

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
  const packageRecord = await packageService.getById(id)
  await packageRecord.destroy()
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
