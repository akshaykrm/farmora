import { UserNameConflictError, UserNotFoundError } from '@errors/user.errors'
import SubscriptionModel from '@models/subscription'
import UserModel from '@models/user'
import { sequelize } from '@utils/db'
import { Op } from 'sequelize'
import userRoles from '@utils/user-roles'
import UserRoleAssignment from '@models/userroleassignment'
import { calculateOffSet } from '@utils/pagination'

const createStaff = async (payload, currentUser) => {
  const existsingUser = await getUserByUsername(payload.username)

  if (existsingUser) {
    throw new UserNameConflictError('username already taken')
  }

  const transaction = await sequelize.transaction()
  try {
    const newUser = await UserModel.create(
      {
        name: payload.name,
        username: payload.username,
        password: payload.password,
        user_type: userRoles.staff.type,
        status: 1,
        parent_id: currentUser.id,
      },
      { transaction }
    )

    // const newRoles = await UserRoleAssignment.bulkCreate(
    //   payload.role_ids.map((roleId) => ({
    //     user_id: newUser.id,
    //     role_id: roleId,
    //   })),
    //   { transaction }
    // )

    // console.log('Assigned Roles:', newRoles)
    // await subscriptionService.create(newUser.id, payload.package_id, transaction);

    // sendMail(
    // 	insertData.username,
    // 	"Your Account Details",
    // 	"accountCreated",
    // 	{
    // 		username: insertData.username,
    // 		password: hashedPassword,
    // 	}
    // );

    console.log('calling create invoice config')
    await transaction.commit()
    delete newUser.dataValues.password
    return newUser
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const getById = async (userId, currentUser) => {
  const { user_type, id } = currentUser || {}
  const filter = { id: userId }

  if (user_type === userRoles.manager.type) {
    filter.parent_id = id
  }

  const userRecord = await UserModel.findOne({
    where: filter,
    attributes: {
      exclude: ['password'],
    },
  })

  if (!userRecord) {
    throw new UserNotFoundError(userId)
  }
  return userRecord
}

const getUserByUsername = async (username) => {
  const userRecord = await UserModel.findOne({
    where: { username },
  })
  return userRecord
}

const getUserByEmail = async (email) => {
  const userRecord = await UserModel.findOne({
    where: { email },
  })
  return userRecord
}

const getMe = async (userId) => {
  const userRecord = await UserModel.findByPk(userId, {
    attributes: {
      exclude: ['password'],
    },
  })

  if (!userRecord) {
    throw new UserNotFoundError(userId)
  }
  return userRecord
}

const updateMe = async (userId, payload) => {
  const userRecord = await getMe(userId)

  if (payload.email) {
    const existingEmailUser = await UserModel.findOne({
      where: {
        email: payload.email,
        id: {
          [Op.ne]: userId,
        },
      },
    })

    if (existingEmailUser) {
      throw new UserNameConflictError('email already taken')
    }
  }

  await userRecord.update({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    state: payload.state ?? userRecord.state,
    district: payload.district ?? userRecord.district,
    place: payload.place ?? userRecord.place,
    pincode: payload.pincode ?? userRecord.pincode,
    bird_capacity: payload.bird_capacity ?? userRecord.bird_capacity,
  })

  return userRecord
}

const update = async (userId, payload, currentUser) => {
  const userRecord = await userService.getById(userId, currentUser)
  await userRecord.update(payload)
}

const deleteById = async (userId, currentUser) => {
  const userRecord = await userService.getById(userId, currentUser)
  await userRecord.destroy()
}

const getAll = async (payload = {}, currentUser) => {
  const { limit, page, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (currentUser.user_type === userRoles.manager.type) {
    filter.parent_id = currentUser.id
  }

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  const { count, rows } = await UserModel.findAndCountAll({
    include: {
      model: SubscriptionModel,
      as: 'subscriptions',
    },
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
    attributes: {
      exclude: ['password'],
    },
  })

  const totalPages = Math.ceil(count / limit)
  return {
    totalPages,
    data: rows,
  }
}

const getCompanyNameById = async (id) => {
  const record = await UserModel.findByPk(id, {
    attributes: {
      include: ['name'],
    },
  })
  return record.name
}

const userService = {
  createStaff,
  getAll,
  getById,
  update,
  getUserByUsername: getUserByUsername,
  getUserByEmail,
  getMe,
  updateMe,
  delete: deleteById,
  getCompanyNameById,
}

export default userService
