import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const BatchModel = sequelize.define(
  'batches',
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    season_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    farm_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    closed_on: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'closed_on',
    },
    closing_statement: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default BatchModel
