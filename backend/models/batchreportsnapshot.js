import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const BatchReportSnapshotModel = sequelize.define(
  'batch_report_snapshots',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    batch_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default BatchReportSnapshotModel
