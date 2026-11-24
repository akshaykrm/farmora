import { Sequelize } from 'sequelize'
import { sequelize } from '@utils/db'

export default sequelize.define(
  'checkout_orders',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    request_id: { type: Sequelize.UUID, allowNull: false, unique: true },
    user_id: { type: Sequelize.INTEGER, allowNull: false },
    package_id: { type: Sequelize.INTEGER, allowNull: false },
    kind: { type: Sequelize.STRING, allowNull: false },
    amount: { type: Sequelize.INTEGER, allowNull: false },
    currency: { type: Sequelize.STRING(3), allowNull: false },
    package_snapshot: { type: Sequelize.JSONB, allowNull: false },
    referral_partner_id: { type: Sequelize.INTEGER },
    referral_snapshot: { type: Sequelize.JSONB },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    razorpay_order_id: { type: Sequelize.STRING, unique: true },
    razorpay_payment_id: { type: Sequelize.STRING, unique: true },
    gateway_settings_id: { type: Sequelize.INTEGER },
    subscription_id: { type: Sequelize.INTEGER, unique: true },
  },
  { underscored: true, timestamps: true }
)
