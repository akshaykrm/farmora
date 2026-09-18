import PermissionModel from '@models/permission'
import RolePermissionModel from '@models/rolepermission'
import UserRoleAssignment from '@models/userroleassignment'
import UserPermissionModel from '@models/userpermission'
import {
  ACTION_ORDER,
  AUDIENCE,
  GROUP_ORDER,
  PERMISSIONS,
  getPermissionMeta,
  platformPermissionKeys,
  tenantPermissionKeys,
} from '../../config/permissions.js'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import logger from '@utils/logger'

export const getMasterId = (user) => {
  if (!user) return null
  if (user.user_type === userRoles.staff.type) {
    return user.parent_id
  }
  return user.id
}

const uniqueKeys = (keys) => [...new Set(keys.filter(Boolean))]

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
    return [...tenantPermissionKeys]
  }

  return loadAssignedPermissionKeys(user.id)
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

    const audience =
      currentUser?.user_type === userRoles.admin.type
        ? null
        : AUDIENCE.tenant

    return enrichPermissionRecords(records, audience)
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
    const error = new Error(`unknown permission ids: ${missing.join(', ')}`)
    error.statusCode = 400
    error.code = 'INVALID_PERMISSION'
    error.name = 'ValidationError'
    throw error
  }

  const platformKeys = records
    .map((record) => record.key)
    .filter((key) => platformPermissionKeys.includes(key))

  if (platformKeys.length > 0) {
    const error = new Error('platform permissions cannot be assigned')
    error.statusCode = 403
    error.code = 'PERMISSION_DENIED'
    error.name = 'PermissionDeniedError'
    throw error
  }

  return records
}

const permissionService = {
  getAllPermissions,
  resolvePermissionKeys,
  getMasterId,
  assertTenantPermissionIds,
}

export default permissionService
