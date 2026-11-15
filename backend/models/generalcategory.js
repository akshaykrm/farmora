import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

export const GENERAL_CATEGORY_TYPES = ['expense', 'sale']

const GeneralCategoryModel = sequelize.define(
  'general_categories',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isIn: [GENERAL_CATEGORY_TYPES] },
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [['active', 'inactive']] },
    },
  },
  {
    underscored: true,
    timestamps: true,
    paranoid: true,
  }
)

export default GeneralCategoryModel
