import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const SalesModel = sequelize.define(
  'sales',
  {
    master_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    season_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    batch_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    buyer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    vehicle_no: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    weight: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    bird_no: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    avg_weight: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    payment_type: {
      type: Sequelize.ENUM('credit', 'cash', 'paid'),
      defaultValue: 'cash',
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
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
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    underscored: true,
    paranoid: true,
    timestamps: true,
  }
)

export default SalesModel
