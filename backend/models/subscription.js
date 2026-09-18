import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const SubscriptionModel = sequelize.define(
  'subscriptions',
  {
    user_id: {
      field: 'user_id',
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    package_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'package_id',
    },
    valid_from: {
      type: Sequelize.DATE,
      allowNull: false,
      field: 'valid_from',
    },
    valid_to: {
      type: Sequelize.DATE,
      allowNull: false,
      field: 'valid_to',
    },
    kind: {
      type: Sequelize.ENUM('initial', 'renewal'),
      allowNull: false,
      defaultValue: 'initial',
    },
  },
  {
    underscored: true,
    paranoid: true,
    timestamps: true,
  }
)

export default SubscriptionModel
