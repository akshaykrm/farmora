import { PERMISSIONS } from '../config/permissions.js'

export default {
  up: async (queryInterface) => {
    const now = new Date()

    for (const permission of PERMISSIONS) {
      await queryInterface.sequelize.query(
        `
          INSERT INTO permissions ("key", description, created_at, updated_at)
          VALUES (:key, :description, :created_at, :updated_at)
          ON CONFLICT ("key")
          DO UPDATE SET
            description = EXCLUDED.description,
            updated_at = EXCLUDED.updated_at
        `,
        {
          replacements: {
            key: permission.key,
            description: permission.description,
            created_at: now,
            updated_at: now,
          },
        }
      )
    }
  },

  down: async (queryInterface) => {
    const keys = PERMISSIONS.map((permission) => permission.key)
    await queryInterface.bulkDelete('permissions', { key: keys }, {})
  },
}
