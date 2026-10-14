'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('batch_report_snapshots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      master_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      batch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'batches', key: 'id' },
        onDelete: 'CASCADE',
      },
      kind: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      computed_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })

    await queryInterface.addIndex(
      'batch_report_snapshots',
      ['batch_id', 'kind'],
      {
        unique: true,
        name: 'batch_report_snapshots_batch_kind_unique',
      }
    )
    await queryInterface.addIndex('batch_report_snapshots', ['master_id'], {
      name: 'batch_report_snapshots_master_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('batch_report_snapshots')
  },
}
