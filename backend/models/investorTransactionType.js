import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const InvestorTransactionTypeModel = sequelize.define(
  'investor_transaction_types',
  {
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default InvestorTransactionTypeModel
