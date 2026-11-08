'use strict'

const keys = ['report_bird_shortage:read', 'report_bird_shortage:export']

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const now = new Date()

    for (const key of keys) {
      const action = key.endsWith(':read') ? 'View' : 'Export'
      await queryInterface.sequelize.query(
        `
          INSERT INTO permissions ("key", description, created_at, updated_at)
          VALUES (:key, :description, :now, :now)
          ON CONFLICT ("key") DO NOTHING
        `,
        {
          replacements: {
            key,
            description: `${action} bird shortage report`,
            now,
          },
        }
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
        `DELETE FROM ${table} WHERE permission_id IN (SELECT id FROM permissions WHERE key IN (:keys))`,
        { replacements: { keys } }
      )
    }
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE key IN (:keys)`,
      { replacements: { keys } }
    )
  },
}
