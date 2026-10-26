import { Sequelize } from 'sequelize'
import { sequelize } from '@utils/db'

export default sequelize.define(
  'payment_gateway_settings',
  {
    key_id: { type: Sequelize.STRING, allowNull: false },
    encrypted_key_secret: { type: Sequelize.TEXT, allowNull: false },
    encrypted_webhook_secret: { type: Sequelize.TEXT },
  },
  { underscored: true, timestamps: true }
)
