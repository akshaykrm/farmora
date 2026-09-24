import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const RoleModel = sequelize.define(
  'roles',
  {
    manager_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    kind: {
      type: Sequelize.ENUM('system', 'custom'),
      allowNull: false,
      defaultValue: 'custom',
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default RoleModel
