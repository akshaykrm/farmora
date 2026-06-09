import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const InvestorManagementModel = sequelize.define(
  'investor_managements',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    investor_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    investor_phone: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    investor_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default InvestorManagementModel
