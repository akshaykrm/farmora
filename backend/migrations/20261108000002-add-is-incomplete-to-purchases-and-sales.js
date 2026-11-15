'use strict'

export default {
  async up(queryInterface, Sequelize) {
    for (const table of ['purchases', 'sales']) {
      await queryInterface.addColumn(table, 'is_incomplete', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      })
      await queryInterface.addIndex(table, ['master_id', 'is_incomplete'], {
        name: `${table}_master_id_is_incomplete_idx`,
      })
    }
  },

  async down(queryInterface) {
    for (const table of ['purchases', 'sales']) {
      await queryInterface.removeIndex(
        table,
        `${table}_master_id_is_incomplete_idx`
      )
      await queryInterface.removeColumn(table, 'is_incomplete')
    }
  },
}
