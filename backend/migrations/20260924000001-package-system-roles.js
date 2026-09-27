'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize

    const hasColumn = async (table, column) => {
      const [rows] = await sequelize.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = :table AND column_name = :column`,
        { replacements: { table, column } }
      )
      return rows.length > 0
    }

    const hasIndex = async (table, index) => {
      const [rows] = await sequelize.query(
        `SELECT 1 FROM pg_indexes
         WHERE tablename = :table AND indexname = :index`,
        { replacements: { table, index } }
      )
      return rows.length > 0
    }

    if (!(await hasColumn('roles', 'kind'))) {
      await queryInterface.addColumn('roles', 'kind', {
        type: Sequelize.ENUM('system', 'custom'),
        allowNull: false,
        defaultValue: 'custom',
      })
    }

    // Raw SQL on purpose. sequelize's postgres changeColumnQuery drops NOT NULL
    // only when the definition omits REFERENCES, and passing REFERENCES re-adds
    // a duplicate FK on every run. The existing FKs are left untouched.
    await sequelize.query(
      'ALTER TABLE "roles" ALTER COLUMN "manager_id" DROP NOT NULL'
    )

    await sequelize.query(
      `UPDATE "roles" SET "kind" = 'custom'
       WHERE "manager_id" IS NOT NULL AND "kind" IS DISTINCT FROM 'custom'`
    )

    if (await hasIndex('roles', 'roles_manager_name_unique')) {
      await queryInterface.removeIndex('roles', 'roles_manager_name_unique')
    }

    if (!(await hasIndex('roles', 'roles_custom_manager_name_unique'))) {
      await queryInterface.addIndex('roles', ['manager_id', 'name'], {
        unique: true,
        name: 'roles_custom_manager_name_unique',
        where: { kind: 'custom' },
      })
    }

    if (!(await hasIndex('roles', 'roles_system_name_unique'))) {
      await queryInterface.addIndex('roles', ['name'], {
        unique: true,
        name: 'roles_system_name_unique',
        where: { kind: 'system' },
      })
    }

    if (!(await hasColumn('packages', 'role_id'))) {
      await queryInterface.addColumn('packages', 'role_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      })
    }

    const now = new Date()
    const systemRoles = [
      ['Basic Role', 'System role for the Basic package'],
      ['Standard Role', 'System role for the Standard package'],
      ['Premium Role', 'System role for the Premium package'],
    ]

    for (const [name, description] of systemRoles) {
      const [existing] = await sequelize.query(
        `SELECT 1 FROM "roles" WHERE "name" = :name AND "kind" = 'system' LIMIT 1`,
        { replacements: { name } }
      )
      if (existing.length) continue
      await queryInterface.bulkInsert('roles', [
        {
          manager_id: null,
          name,
          description,
          kind: 'system',
          created_at: now,
          updated_at: now,
        },
      ])
    }

    const [roleRows] = await sequelize.query(
      `SELECT id, name FROM "roles" WHERE "kind" = 'system'`
    )
    const roleIdByName = Object.fromEntries(
      roleRows.map((row) => [row.name, row.id])
    )

    const packageRoleMap = [
      ['Basic', 'Basic Role'],
      ['Standard', 'Standard Role'],
      ['Premium', 'Premium Role'],
    ]

    for (const [packageName, roleName] of packageRoleMap) {
      const roleId = roleIdByName[roleName]
      if (!roleId) continue
      await sequelize.query(
        `UPDATE "packages" SET "role_id" = :roleId
         WHERE "name" = :packageName
           AND "deleted_at" IS NULL
           AND "role_id" IS DISTINCT FROM :roleId`,
        {
          replacements: { roleId, packageName },
        }
      )
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    const hasColumn = async (table, column) => {
      const [rows] = await sequelize.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = :table AND column_name = :column`,
        { replacements: { table, column } }
      )
      return rows.length > 0
    }

    const hasIndex = async (table, index) => {
      const [rows] = await sequelize.query(
        `SELECT 1 FROM pg_indexes
         WHERE tablename = :table AND indexname = :index`,
        { replacements: { table, index } }
      )
      return rows.length > 0
    }

    if (await hasColumn('packages', 'role_id')) {
      await queryInterface.removeColumn('packages', 'role_id')
    }

    await queryInterface.bulkDelete('roles', { kind: 'system' })

    if (await hasIndex('roles', 'roles_system_name_unique')) {
      await queryInterface.removeIndex('roles', 'roles_system_name_unique')
    }

    if (await hasIndex('roles', 'roles_custom_manager_name_unique')) {
      await queryInterface.removeIndex('roles', 'roles_custom_manager_name_unique')
    }

    // Raw SQL for the same reason as up(): changeColumn would re-add a
    // duplicate FK on roles.manager_id instead of restoring NOT NULL.
    await sequelize.query(
      'ALTER TABLE "roles" ALTER COLUMN "manager_id" SET NOT NULL'
    )

    if (await hasColumn('roles', 'kind')) {
      await queryInterface.removeColumn('roles', 'kind')
    }

    await sequelize.query('DROP TYPE IF EXISTS "enum_roles_kind";')

    if (!(await hasIndex('roles', 'roles_manager_name_unique'))) {
      await queryInterface.addIndex('roles', ['manager_id', 'name'], {
        unique: true,
        name: 'roles_manager_name_unique',
      })
    }
  },
}
