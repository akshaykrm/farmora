import { Sequelize } from 'sequelize'
import { sequelize } from '@utils/db'

export default sequelize.define(
  'email_settings',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
    sender_email: { type: Sequelize.STRING },
    sender_name: { type: Sequelize.STRING },
    encrypted_password: { type: Sequelize.TEXT },
    smtp_host: { type: Sequelize.STRING },
    smtp_port: { type: Sequelize.INTEGER },
    smtp_secure: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    frontend_url: { type: Sequelize.STRING },
  },
  { underscored: true, timestamps: true }
)
