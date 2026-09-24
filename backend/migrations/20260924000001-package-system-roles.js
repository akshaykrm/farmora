'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('roles', 'kind', {
      type: Sequelize.ENUM('system', 'custom'),
      allowNull: false,
      defaultValue: 'custom',
    })

    await queryInterface.changeColumn('roles', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    })

    await queryInterface.sequelize.query(
      'UPDATE roles SET kind = \'custom\' WHERE manager_id IS NOT NULL'
    )

    await queryInterface.removeIndex('roles', 'roles_manager_name_unique')

    await queryInterface.addIndex('roles', ['manager_id', 'name'], {
      unique: true,
      name: 'roles_custom_manager_name_unique',
      where: { kind: 'custom' },
    })

    await queryInterface.addIndex('roles', ['name'], {
      unique: true,
      name: 'roles_system_name_unique',
      where: { kind: 'system' },
    })

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

    const now = new Date()
    await queryInterface.bulkInsert('roles', [
      {
        manager_id: null,
        name: 'Basic Role',
        description: 'System role for the Basic package',
        kind: 'system',
        created_at: now,
        updated_at: now,
      },
      {
        manager_id: null,
        name: 'Standard Role',
        description: 'System role for the Standard package',
        kind: 'system',
        created_at: now,
        updated_at: now,
      },
      {
        manager_id: null,
        name: 'Premium Role',
        description: 'System role for the Premium package',
        kind: 'system',
        created_at: now,
        updated_at: now,
      },
    ])

    const [systemRoles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE kind = 'system'`
    )
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
        {
          replacements: { roleId, packageName },
        }
      )
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('packages', 'role_id')

    await queryInterface.bulkDelete('roles', { kind: 'system' })

    await queryInterface.removeIndex('roles', 'roles_system_name_unique')
    await queryInterface.removeIndex('roles', 'roles_custom_manager_name_unique')

    await queryInterface.changeColumn('roles', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    })

    await queryInterface.removeColumn('roles', 'kind')

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_roles_kind";'
    )

    await queryInterface.addIndex('roles', ['manager_id', 'name'], {
      unique: true,
      name: 'roles_manager_name_unique',
    })
  },
}
