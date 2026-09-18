import { sequelize } from '@utils/db'
import { Sequelize } from 'sequelize'

const UserPermissionModel = sequelize.define(
  'user_permissions',
  {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    permission_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

export default UserPermissionModel
