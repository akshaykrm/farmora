import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const BrandModel = sequelize.define(
  'brands',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
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
    paranoid: true,
  }
)

export default BrandModel
