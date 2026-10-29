export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const options = { transaction }
      await queryInterface.addColumn(
        'users',
        'approval_status',
        {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'approved',
        },
        options
      )
      await queryInterface.addColumn(
        'users',
        'requested_package_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'packages', key: 'id' },
          onDelete: 'SET NULL',
        },
        options
      )
      await queryInterface.addColumn(
        'users',
        'approved_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        options
      )
      await queryInterface.addColumn(
        'users',
        'approved_by',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        options
      )
      await queryInterface.sequelize.query(
        "ALTER TABLE users ADD CONSTRAINT users_approval_status_valid CHECK (approval_status IN ('pending', 'approved'))",
        options
      )
    })
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const field of [
        'approved_by',
        'approved_at',
        'requested_package_id',
        'approval_status',
      ]) {
        await queryInterface.removeColumn('users', field, { transaction })
      }
    })
  },
}
