import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const ItemModel = sequelize.define(
  'items',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: { type: Sequelize.STRING, allowNull: true },
    brand_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'brand_id',
    },
    vendor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'vendor_id',
    },
    base_price: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      field: 'base_price',
    },
    type: {
      type: Sequelize.ENUM(
        'chick',
        'medicine',
        'FINISHER',
        'STARTER',
        'PRE STARTER',
        'integration',
        'working',
        'regular'
      ),
      defaultValue: 'regular',
      allowNull: false,
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

export default ItemModel
