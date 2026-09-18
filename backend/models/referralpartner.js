import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const ReferralPartnerModel = sequelize.define(
  'referral_partners',
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default ReferralPartnerModel
