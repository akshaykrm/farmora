import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const BatchDailyLogModel = sequelize.define(
  'batch_daily_logs',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    batch_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default BatchDailyLogModel
