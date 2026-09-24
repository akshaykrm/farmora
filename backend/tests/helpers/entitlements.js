import PackageModel from '@models/package'
import RoleModel from '@models/role'
import PermissionModel from '@models/permission'
import RolePermissionModel from '@models/rolepermission'
import { tenantPermissionKeys } from '../../config/permissions.js'
import { Op } from 'sequelize'

export const setRolePermissionKeys = async (roleId, keys = []) => {
  await RolePermissionModel.destroy({ where: { role_id: roleId } })
  if (!keys.length) return

  const permissions = await PermissionModel.findAll({
    where: { key: { [Op.in]: keys } },
    attributes: ['id', 'key'],
  })

  if (permissions.length !== keys.length) {
    const found = new Set(permissions.map((row) => row.key))
    const missing = keys.filter((key) => !found.has(key))
    throw new Error(`missing permissions for test setup: ${missing.join(', ')}`)
  }

  await RolePermissionModel.bulkCreate(
    permissions.map((permission) => ({
      role_id: roleId,
      permission_id: permission.id,
    }))
  )
}

export const setPackageRolePermissionKeys = async (packageId, keys = []) => {
  const packageRecord = await PackageModel.findByPk(packageId)
  if (!packageRecord?.role_id) {
    throw new Error(`package ${packageId} has no system role`)
  }
  await setRolePermissionKeys(packageRecord.role_id, keys)
  return packageRecord.role_id
}

export const grantAllTenantPermissionsToPackage = async (packageId) => {
  return setPackageRolePermissionKeys(packageId, [...tenantPermissionKeys])
}

export const createSystemRoleWithKeys = async (name, keys = []) => {
  const role = await RoleModel.create({
    manager_id: null,
    name,
    description: `${name} system role`,
    kind: 'system',
  })
  await setRolePermissionKeys(role.id, keys)
  return role
}
