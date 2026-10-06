'use strict'

const DAILY_LOG_PERMISSIONS = [
  { key: 'batch_daily_log:read', description: 'View batch daily log' },
  { key: 'batch_daily_log:write', description: 'Add batch daily log entries' },
  { key: 'batch_daily_log:edit', description: 'Edit batch daily log entries' },
  {
    key: 'batch_daily_log:delete',
    description: 'Delete batch daily log entries',
  },
  { key: 'batch_daily_log:export', description: 'Export batch daily log' },
]

const keys = DAILY_LOG_PERMISSIONS.map((permission) => permission.key)

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const now = new Date()

    for (const permission of DAILY_LOG_PERMISSIONS) {
      await queryInterface.sequelize.query(
        `
          INSERT INTO permissions ("key", description, created_at, updated_at)
          VALUES (:key, :description, :now, :now)
          ON CONFLICT ("key") DO NOTHING
        `,
        { replacements: { ...permission, now } }
      )
    }

    await queryInterface.sequelize.query(
      `
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT r.id, p.id, :now, :now
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.kind = 'system'
          AND p.key IN (:keys)
          AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp
            WHERE rp.role_id = r.id AND rp.permission_id = p.id
          )
      `,
      { replacements: { keys, now } }
    )
  },

  async down(queryInterface) {
    for (const table of ['role_permissions', 'user_permissions']) {
      await queryInterface.sequelize.query(
        `
          DELETE FROM ${table}
          WHERE permission_id IN (SELECT id FROM permissions WHERE key IN (:keys))
        `,
        { replacements: { keys } }
      )
    }
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE key IN (:keys)`,
      { replacements: { keys } }
    )
  },
}
