import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const GeneralExpenseModel = sequelize.define(
  'general_expenses',
  {
    season_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    purpose: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    narration: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM('inactive', 'active'),
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default GeneralExpenseModel
