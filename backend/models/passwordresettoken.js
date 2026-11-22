import { Sequelize } from 'sequelize'
import { sequelize } from '@utils/db'

export default sequelize.define(
  'password_reset_tokens',
  {
    user_id: { type: Sequelize.INTEGER, allowNull: false },
    token_hash: { type: Sequelize.STRING(64), allowNull: false },
    expires_at: { type: Sequelize.DATE, allowNull: false },
    used_at: { type: Sequelize.DATE },
    request_ip: { type: Sequelize.STRING(64) },
  },
  { underscored: true, timestamps: true }
)
