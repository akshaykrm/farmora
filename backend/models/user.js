import { sequelize } from '@utils/db'
import userRoles from '@utils/user-roles'
import bcryptjs from 'bcryptjs'
import { Sequelize } from 'sequelize'

const { hash, compare } = bcryptjs

const UserModel = sequelize.define(
  'users',
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
      field: 'email',
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'phone',
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_type: {
      type: Sequelize.ENUM(
        userRoles.admin.type,
        userRoles.manager.type,
        userRoles.staff.type
      ),
      defaultValue: userRoles.staff.type,
      allowNull: false,
      field: 'user_type',
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'status',
    },
    parent_id: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'parent_id',
    },
    last_login: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'last_login',
    },
  },
  {
    underscored: true,
    timestamps: true,
  }
)

// Hash password before saving
UserModel.beforeCreate(async (user) => {
  user.password = await hash(user.password, 10)
})

// Instance method to compare passwords
UserModel.prototype.comparePassword = async function (password) {
  return compare(password, this.password)
}

export default UserModel
