import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'
import { getEffectivePackagePrice } from '@utils/package-price'

const PackageModel = sequelize.define(
  'packages',
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    actual_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: Sequelize.VIRTUAL,
      get() {
        return getEffectivePackagePrice(this)
      },
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive', 'disabled'),
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
    paranoid: true,
    timestamps: true,
  }
)

export default PackageModel
