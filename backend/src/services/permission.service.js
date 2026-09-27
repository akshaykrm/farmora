import PermissionModel from '@models/permission'
import RolePermissionModel from '@models/rolepermission'
import UserRoleAssignment from '@models/userroleassignment'
import UserPermissionModel from '@models/userpermission'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import RoleModel from '@models/role'
import {
  ACTION_ORDER,
  AUDIENCE,
  GROUP_ORDER,
  PERMISSIONS,
  getPermissionMeta,
  platformPermissionKeys,
} from '../../config/permissions.js'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import logger from '@utils/logger'

export const getMasterId = (user) => {
  if (!user) return null
  if (user.user_type === userRoles.staff.type) {
    return user.parent_id
  }
  return user.id
}

const uniqueKeys = (keys) => [...new Set(keys.filter(Boolean))]

const validationError = (message, code = 'INVALID_PERMISSION', statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  error.name =
    statusCode === 403 ? 'PermissionDeniedError' : 'ValidationError'
  return error
}

export const getPermissionKeysForRoleId = async (roleId) => {
  if (!roleId) return []

  const rolePermissions = await RolePermissionModel.findAll({
    where: { role_id: roleId },
    attributes: ['permission_id'],
  })

  const permissionIds = rolePermissions.map((row) => row.permission_id)
  if (!permissionIds.length) return []

  const permissions = await PermissionModel.findAll({
    where: { id: { [Op.in]: permissionIds } },
    attributes: ['key'],
  })

  return uniqueKeys(permissions.map((permission) => permission.key))
}

export const getCurrentPackageRolePermissionKeys = async (masterId) => {
  if (!masterId) return []

  const now = dayjs().toDate()
  const subscription = await SubscriptionModel.findOne({
    where: {
      user_id: masterId,
      valid_from: { [Op.lte]: now },
      valid_to: { [Op.gte]: now },
    },
    order: [
      ['valid_to', 'DESC'],
      ['id', 'DESC'],
    ],
    include: [
      {
        model: PackageModel,
        as: 'package',
        required: false,
        include: [
          {
            model: RoleModel,
            as: 'role',
            required: false,
          },
        ],
      },
    ],
  })

  const roleId = subscription?.package?.role_id || subscription?.package?.role?.id
  if (!roleId) return []

  return getPermissionKeysForRoleId(roleId)
}

export const intersectWithPackage = async (keys, masterId) => {
  const packageKeys = await getCurrentPackageRolePermissionKeys(masterId)
  const packageSet = new Set(packageKeys)
  return uniqueKeys(keys).filter((key) => packageSet.has(key))
}

export const assertWithinPackagePermissionIds = async (
  permissionIds = [],
  masterId
) => {
  if (!permissionIds.length) return []

  const records = await assertTenantPermissionIds(permissionIds)
  const packageKeys = await getCurrentPackageRolePermissionKeys(masterId)
  const packageSet = new Set(packageKeys)
  const outside = records
    .map((record) => record.key)
    .filter((key) => !packageSet.has(key))

  if (outside.length > 0) {
    throw validationError(
      `permissions not available in current package: ${outside.join(', ')}`,
      'PACKAGE_PERMISSION_DENIED',
      403
    )
  }

  return records
}

const loadAssignedPermissionKeys = async (userId) => {
  const [roleAssignments, extraAssignments] = await Promise.all([
    UserRoleAssignment.findAll({
      where: { user_id: userId },
      attributes: ['role_id'],
    }),
    UserPermissionModel.findAll({
      where: { user_id: userId },
      attributes: ['permission_id'],
    }),
  ])

  const roleIds = roleAssignments.map((assignment) => assignment.role_id)
  const extraPermissionIds = extraAssignments.map(
    (assignment) => assignment.permission_id
  )

  const rolePermissionIds =
    roleIds.length > 0
      ? (
          await RolePermissionModel.findAll({
            where: { role_id: { [Op.in]: roleIds } },
            attributes: ['permission_id'],
          })
        ).map((row) => row.permission_id)
      : []

  const permissionIds = uniqueKeys([...rolePermissionIds, ...extraPermissionIds])

  if (permissionIds.length === 0) {
    return []
  }

  const permissions = await PermissionModel.findAll({
    where: { id: { [Op.in]: permissionIds } },
    attributes: ['key'],
  })

  return uniqueKeys(permissions.map((permission) => permission.key))
}

export const resolvePermissionKeys = async (user) => {
  if (!user) return []

  if (user.user_type === userRoles.admin.type) {
    return PERMISSIONS.map((permission) => permission.key)
  }

  if (user.user_type === userRoles.manager.type) {
    return getCurrentPackageRolePermissionKeys(user.id)
  }

  const assigned = await loadAssignedPermissionKeys(user.id)
  return intersectWithPackage(assigned, user.parent_id)
}

const groupIndex = (group) => {
  const index = GROUP_ORDER.indexOf(group)
  return index === -1 ? GROUP_ORDER.length : index
}

const actionIndex = (action) => {
  const index = ACTION_ORDER.indexOf(action)
  return index === -1 ? ACTION_ORDER.length : index
}

export const enrichPermissionRecords = (records, audience) => {
  return records
    .map((record) => {
      const json = record.toJSON ? record.toJSON() : record
      const meta = getPermissionMeta(json.key)
      const action = meta?.action || json.key.split(':')[1] || json.key
      return {
        ...json,
        group: meta?.group || 'Other',
        submenu: meta?.submenu ?? null,
        action,
        actionLabel: meta?.actionLabel || json.description,
        audience: meta?.audience || AUDIENCE.tenant,
      }
    })
    .filter((record) => !audience || record.audience === audience)
    .sort((a, b) => {
      if (a.group !== b.group) {
        return groupIndex(a.group) - groupIndex(b.group)
      }
      const submenuA = a.submenu || ''
      const submenuB = b.submenu || ''
      if (submenuA !== submenuB) {
        return submenuA.localeCompare(submenuB)
      }
      if (a.action !== b.action) {
        return actionIndex(a.action) - actionIndex(b.action)
      }
      return a.key.localeCompare(b.key)
    })
}

const getAllPermissions = async (currentUser) => {
  try {
    const records = await PermissionModel.findAll({
      order: [['key', 'ASC']],
    })

    if (currentUser?.user_type === userRoles.admin.type) {
      return enrichPermissionRecords(records, null)
    }

    const masterId = getMasterId(currentUser)
    const packageKeys = new Set(
      await getCurrentPackageRolePermissionKeys(masterId)
    )
    const allowed = records.filter((record) => packageKeys.has(record.key))
    return enrichPermissionRecords(allowed, AUDIENCE.tenant)
  } catch (error) {
    logger.error({ err: error }, 'Error fetching permissions')
    throw error
  }
}

export const assertTenantPermissionIds = async (permissionIds = []) => {
  if (!permissionIds.length) return []

  const records = await PermissionModel.findAll({
    where: { id: { [Op.in]: permissionIds } },
    attributes: ['id', 'key'],
  })

  if (records.length !== permissionIds.length) {
    const foundIds = new Set(records.map((record) => record.id))
    const missing = permissionIds.filter((id) => !foundIds.has(id))
    throw validationError(`unknown permission ids: ${missing.join(', ')}`)
  }

  const platformKeys = records
    .map((record) => record.key)
    .filter((key) => platformPermissionKeys.includes(key))

  if (platformKeys.length > 0) {
    throw validationError(
      'platform permissions cannot be assigned',
      'PERMISSION_DENIED',
      403
    )
  }

  return records
}

const permissionService = {
  getAllPermissions,
  resolvePermissionKeys,
  getMasterId,
  assertTenantPermissionIds,
  assertWithinPackagePermissionIds,
  getCurrentPackageRolePermissionKeys,
  getPermissionKeysForRoleId,
  intersectWithPackage,
}

export default permissionService
