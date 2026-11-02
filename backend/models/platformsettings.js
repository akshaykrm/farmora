import { Sequelize } from 'sequelize'
import { sequelize } from '@utils/db'

export default sequelize.define(
  'platform_settings',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
    subscription_reminder_days: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: { isInt: true, min: 0, max: 365 },
    },
  },
  { timestamps: false }
)
