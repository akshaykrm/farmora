import RoleModel from '@models/role'
import { PermissionDeniedError } from '@errors/auth.errors'
import { sequelize } from '@utils/db'
import logger from '@utils/logger'
import { Op, UniqueConstraintError } from 'sequelize'
import { RoleAlreadyExistsError, RoleNotFoundError } from '@errors/role.errors'
import RolePermissionModel from '@models/rolepermission'
import userRoles from '@utils/user-roles'
import PermissionModel from '@models/permission'
import permissionService from '@services/permission.service'
import { getMasterId } from '@services/permission.service'

const getRoleOwnerId = (currentUser, payload = {}) => {
  if (currentUser.user_type === userRoles.admin.type) {
    return payload.manager_id || null
  }
  return getMasterId(currentUser)
}

const createRoleService = async (payload, currentUser) => {
  logger.debug({ role: payload.name }, 'Creating role')

  const managerId = getRoleOwnerId(currentUser, payload)
  if (!managerId) {
    throw new PermissionDeniedError('manager_id is required')
  }

  const permissionIds = payload.permission_ids || []
  await permissionService.assertTenantPermissionIds(permissionIds)

  const transaction = await sequelize.transaction()
  try {
    const newRole = await RoleModel.create(
      {
        manager_id: managerId,
        name: payload.name,
        description: payload.description,
      },
      {
        underscored: true,
        paranoid: true,
        timestamps: true,
        transaction,
      }
    )

    await RolePermissionModel.bulkCreate(
      permissionIds.map((permissionId) => ({
        role_id: newRole.id,
        permission_id: permissionId,
      })),
      { transaction }
    )

    await transaction.commit()
    return newRole
  } catch (error) {
    await transaction.rollback()
    logger.error({ err: error }, 'Error creating role')
    throw error
  }
}

const getAllRolesService = async (payload, currentUser) => {
  const { limit, page, ...filter } = payload
  const offset = (page - 1) * limit

  if (currentUser.user_type === userRoles.manager.type) {
    filter.manager_id = currentUser.id
  }

  if (currentUser.user_type === userRoles.staff.type) {
    filter.manager_id = currentUser.parent_id
  }

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  const { count, rows } = await RoleModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
    include: [
      {
        model: RolePermissionModel,
        as: 'role_permissions',
        required: false,
      },
    ],
    attributes: {
      exclude: ['password'],
    },
  })

  const totalPages = Math.ceil(count / limit)
  return {
    page,
    limit,
    total: count,
    totalPages,
    data: rows,
  }
}

const getRoleByIdService = async (roleId, currentUser) => {
  const { user_type, id } = currentUser || {}
  const filter = { id: roleId }

  if (user_type === userRoles.manager.type) {
    filter.manager_id = id
  }

  if (user_type === userRoles.staff.type) {
    filter.manager_id = currentUser.parent_id
  }

  const roleRecord = await RoleModel.findOne({
    where: filter,
    include: [
      {
        model: RolePermissionModel,
        as: 'role_permissions',
        required: false,
        attributes: ['permission_id'],
      },
    ],
  })

  if (!roleRecord) {
    throw new RoleNotFoundError(roleId)
  }

  const permissionIds = (roleRecord.role_permissions || [])
    .map((rp) => rp.permission_id)
    .filter(Boolean)

  const permissions =
    permissionIds.length > 0
      ? await PermissionModel.findAll({
          where: { id: { [Op.in]: permissionIds } },
          attributes: ['id', 'key', 'description'],
        })
      : []

  roleRecord.dataValues.permissions = permissions
  delete roleRecord.dataValues.role_permissions

  return roleRecord
}

const updateRoleByIdService = async (roleId, payload, currentUser) => {
  const roleRecord = await getRoleByIdService(roleId, currentUser)
  const permissionIds = payload.permission_ids || []
  await permissionService.assertTenantPermissionIds(permissionIds)
  const transaction = await sequelize.transaction()
  try {
    const { permission_ids, ...roleFields } = payload
    await roleRecord.update(roleFields, { transaction })
    await RolePermissionModel.destroy({
      where: { role_id: roleId },
      transaction,
    })
    const rolePermissions = permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }))
    await RolePermissionModel.bulkCreate(rolePermissions, { transaction })
    await transaction.commit()
    return null
  } catch (error) {
    await transaction.rollback()
    if (error instanceof UniqueConstraintError) {
      throw new RoleAlreadyExistsError(payload.name)
    }
    throw error
  }
}

const deleteRoleByIdService = async (roleId, currentUser) => {
  const roleRecord = await getRoleByIdService(roleId, currentUser)
  RolePermissionModel.destroy({
    where: { role_id: roleId },
  })
  await roleRecord.destroy()
}

const roleService = {
  createRoleService,
  getAllRolesService,
  getRoleByIdService,
  updateRoleByIdService,
  deleteRoleByIdService,
}

export default roleService
