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
    referral_bonus_type: {
      type: Sequelize.ENUM('none', 'fixed', 'percentage'),
      allowNull: false,
      defaultValue: 'none',
      field: 'referral_bonus_type',
    },
    referral_bonus_value: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      field: 'referral_bonus_value',
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default ReferralPartnerModel
