import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const PurchaseModel = sequelize.define(
  'purchases',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    total_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    net_amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    invoice_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    invoice_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    price_per_unit: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    vendor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    season_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    farm_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    batch_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('inactive', 'active'),
      defaultValue: 'active',
      allowNull: false,
    },
    payment_type: {
      type: Sequelize.ENUM('credit', 'paid'),
      defaultValue: 'credit',
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default PurchaseModel
