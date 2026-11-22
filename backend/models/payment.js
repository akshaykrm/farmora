import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const PaymentModel = sequelize.define(
  'payments',
  {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    subscription_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    transaction_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    underscored: true,
    paranoid: true,
    timestamps: true,
  }
)

export default PaymentModel
