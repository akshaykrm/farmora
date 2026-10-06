'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('batches', 'log_start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    })

    await queryInterface.createTable('batch_daily_logs', {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      mortality: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      issued_feed: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      consumed_feed: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      avg_body_weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    await queryInterface.addIndex('batch_daily_logs', ['batch_id', 'date'], {
      unique: true,
      name: 'batch_daily_logs_batch_id_date_unique',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('batch_daily_logs')
    await queryInterface.removeColumn('batches', 'log_start_date')
  },
}
