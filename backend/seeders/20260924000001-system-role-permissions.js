'use strict'

import { AUDIENCE, PERMISSIONS } from '../config/permissions.js'

/**
 * Link packages to system roles and assign every tenant permission
 * as a default ceiling. Super Admin can trim via System Roles UI (plan 2A).
 */
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const [systemRoles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE kind = 'system'`
    )
    if (!systemRoles.length) return

    const roleIdByName = Object.fromEntries(
      systemRoles.map((row) => [row.name, row.id])
    )
    const packageRoleMap = [
      ['Basic', 'Basic Role'],
      ['Standard', 'Standard Role'],
      ['Premium', 'Premium Role'],
    ]
    for (const [packageName, roleName] of packageRoleMap) {
      const roleId = roleIdByName[roleName]
      if (!roleId) continue
      await queryInterface.sequelize.query(
        `UPDATE packages SET role_id = :roleId WHERE name = :packageName AND deleted_at IS NULL`,
        { replacements: { roleId, packageName } }
      )
    }

    const tenantKeys = PERMISSIONS.filter(
      (permission) => permission.audience === AUDIENCE.tenant
    ).map((permission) => permission.key)

    if (!tenantKeys.length) return

    const [permissionRows] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE key IN (:keys)`,
      { replacements: { keys: tenantKeys } }
    )

    if (!permissionRows.length) return

    const now = new Date()
    const rows = []
    for (const role of systemRoles) {
      for (const permission of permissionRows) {
        rows.push({
          role_id: role.id,
          permission_id: permission.id,
          created_at: now,
          updated_at: now,
        })
      }
    }

    if (rows.length) {
      await queryInterface.bulkInsert('role_permissions', rows)
    }
  },

  async down(queryInterface) {
    const [systemRoles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE kind = 'system'`
    )
    if (!systemRoles.length) return

    await queryInterface.bulkDelete('role_permissions', {
      role_id: systemRoles.map((role) => role.id),
    })

    await queryInterface.sequelize.query(
      `UPDATE packages SET role_id = NULL WHERE role_id IN (:roleIds)`,
      { replacements: { roleIds: systemRoles.map((role) => role.id) } }
    )
  },
}
