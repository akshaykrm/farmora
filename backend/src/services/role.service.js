import RoleModel from '@models/role'
import PackageModel from '@models/package'
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

const ROLE_KIND = {
  system: 'system',
  custom: 'custom',
}

const isAdmin = (user) => user?.user_type === userRoles.admin.type

const getRoleOwnerId = (currentUser, payload = {}) => {
  if (isAdmin(currentUser)) {
    return payload.manager_id || null
  }
  return getMasterId(currentUser)
}

const assertCanManageSystemRoles = (currentUser) => {
  if (!isAdmin(currentUser)) {
    throw new PermissionDeniedError('only admins can manage system roles')
  }
}

const createRoleService = async (payload, currentUser) => {
  logger.debug({ role: payload.name }, 'Creating role')

  const kind =
    payload.kind === ROLE_KIND.system ? ROLE_KIND.system : ROLE_KIND.custom
  const permissionIds = payload.permission_ids || []

  if (kind === ROLE_KIND.system) {
    assertCanManageSystemRoles(currentUser)
    await permissionService.assertTenantPermissionIds(permissionIds)
  } else {
    const managerId = getRoleOwnerId(currentUser, payload)
    if (!managerId) {
      throw new PermissionDeniedError('manager_id is required')
    }
    if (isAdmin(currentUser)) {
      await permissionService.assertTenantPermissionIds(permissionIds)
    } else {
      await permissionService.assertWithinPackagePermissionIds(
        permissionIds,
        managerId
      )
    }
  }

  const managerId =
    kind === ROLE_KIND.system ? null : getRoleOwnerId(currentUser, payload)

  const transaction = await sequelize.transaction()
  try {
    const newRole = await RoleModel.create(
      {
        manager_id: managerId,
        name: payload.name,
        description: payload.description,
        kind,
      },
      {
        underscored: true,
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
    if (error instanceof UniqueConstraintError) {
      throw new RoleAlreadyExistsError(payload.name)
    }
    throw error
  }
}

const getAllRolesService = async (payload, currentUser) => {
  const { limit, page, kind, ...filter } = payload
  const offset = (page - 1) * limit

  if (isAdmin(currentUser)) {
    if (kind === ROLE_KIND.system) {
      filter.kind = ROLE_KIND.system
      delete filter.manager_id
    } else if (kind === ROLE_KIND.custom) {
      filter.kind = ROLE_KIND.custom
    } else if (!filter.manager_id && !kind) {
      filter.kind = ROLE_KIND.custom
    }
  } else {
    filter.kind = ROLE_KIND.custom
    if (currentUser.user_type === userRoles.manager.type) {
      filter.manager_id = currentUser.id
    }
    if (currentUser.user_type === userRoles.staff.type) {
      filter.manager_id = currentUser.parent_id
    }
  }

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  const { count, rows } = await RoleModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
    distinct: true,
    col: 'id',
    include: [
      {
        model: RolePermissionModel,
        as: 'role_permissions',
        required: false,
      },
    ],
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
    filter.kind = ROLE_KIND.custom
  }

  if (user_type === userRoles.staff.type) {
    filter.manager_id = currentUser.parent_id
    filter.kind = ROLE_KIND.custom
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

  if (roleRecord.kind === ROLE_KIND.system) {
    assertCanManageSystemRoles(currentUser)
    await permissionService.assertTenantPermissionIds(permissionIds)
  } else if (isAdmin(currentUser)) {
    await permissionService.assertTenantPermissionIds(permissionIds)
  } else {
    await permissionService.assertWithinPackagePermissionIds(
      permissionIds,
      roleRecord.manager_id
    )
  }

  const transaction = await sequelize.transaction()
  try {
    const { permission_ids, kind, manager_id, ...roleFields } = payload
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

  if (roleRecord.kind === ROLE_KIND.system) {
    assertCanManageSystemRoles(currentUser)
    const linkedPackages = await PackageModel.count({
      where: { role_id: roleId },
    })
    if (linkedPackages > 0) {
      throw new PermissionDeniedError(
        'cannot delete a system role that is assigned to a package'
      )
    }
  }

  await RolePermissionModel.destroy({
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
  ROLE_KIND,
}

export default roleService
