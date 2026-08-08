import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const VendorModel = sequelize.define(
  'vendors',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    vendor_type: {
      type: Sequelize.ENUM('supplier', 'customer', 'internal'),
      allowNull: false,
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    opening_balance: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default VendorModel
