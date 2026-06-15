import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const InvestorTransactionModel = sequelize.define(
  'investor_transactions',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    investor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    transaction_type_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    transaction_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    reference_transaction_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    txn_id: {
      type: Sequelize.STRING(50),
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default InvestorTransactionModel
