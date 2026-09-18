import { UserNameConflictError, UserNotFoundError } from '@errors/user.errors'
import { PermissionDeniedError } from '@errors/auth.errors'
import SubscriptionModel from '@models/subscription'
import UserModel from '@models/user'
import RoleModel from '@models/role'
import UserRoleAssignment from '@models/userroleassignment'
import UserPermissionModel from '@models/userpermission'
import { sequelize } from '@utils/db'
import { Op } from 'sequelize'
import bcryptjs from 'bcryptjs'
import userRoles from '@utils/user-roles'
import logger from '@utils/logger'
import { calculateOffSet } from '@utils/pagination'
import permissionService, { getMasterId } from '@services/permission.service'

const getAccountOwnerId = (currentUser, payload = {}) => {
  if (currentUser.user_type === userRoles.admin.type) {
    return payload.parent_id || null
  }
  if (currentUser.user_type === userRoles.staff.type) {
    return currentUser.parent_id
  }
  return currentUser.id
}

const assertAssignableRoles = async (roleIds, managerId) => {
  if (!roleIds.length) return

  const roles = await RoleModel.findAll({
    where: {
      id: { [Op.in]: roleIds },
      manager_id: managerId,
    },
  })

  if (roles.length !== roleIds.length) {
    throw new PermissionDeniedError('roles must belong to this account')
  }
}

const replaceUserAccess = async (userId, payload, managerId, transaction) => {
  const roleIds = payload.role_ids || []
  const permissionIds = payload.permission_ids || []

  await assertAssignableRoles(roleIds, managerId)
  await permissionService.assertTenantPermissionIds(permissionIds)

  await UserRoleAssignment.destroy({ where: { user_id: userId }, transaction })
  await UserPermissionModel.destroy({
    where: { user_id: userId },
    transaction,
  })

  if (roleIds.length > 0) {
    await UserRoleAssignment.bulkCreate(
      roleIds.map((roleId) => ({
        user_id: userId,
        role_id: roleId,
      })),
      { transaction }
    )
  }

  if (permissionIds.length > 0) {
    await UserPermissionModel.bulkCreate(
      permissionIds.map((permissionId) => ({
        user_id: userId,
        permission_id: permissionId,
      })),
      { transaction }
    )
  }
}

const attachAccessFields = async (userRecord) => {
  if (!userRecord) return userRecord

  const [roleAssignments, permissionAssignments, permissions] =
    await Promise.all([
      UserRoleAssignment.findAll({
        where: { user_id: userRecord.id },
        attributes: ['role_id'],
      }),
      UserPermissionModel.findAll({
        where: { user_id: userRecord.id },
        attributes: ['permission_id'],
      }),
      permissionService.resolvePermissionKeys(userRecord),
    ])

  userRecord.dataValues.role_ids = roleAssignments.map((row) => row.role_id)
  userRecord.dataValues.permission_ids = permissionAssignments.map(
    (row) => row.permission_id
  )
  userRecord.dataValues.permissions = permissions
  userRecord.dataValues.master_id = getMasterId(userRecord)
  return userRecord
}

const createStaff = async (payload, currentUser) => {
  const existsingUser = await getUserByUsername(payload.username)

  if (existsingUser) {
    throw new UserNameConflictError('username already taken')
  }

  const parentId = getAccountOwnerId(currentUser, payload)
  if (!parentId) {
    throw new PermissionDeniedError('parent_id is required')
  }

  if (currentUser.user_type === userRoles.admin.type) {
    const parent = await UserModel.findByPk(parentId)
    if (!parent || parent.user_type !== userRoles.manager.type) {
      throw new PermissionDeniedError('parent must be a subscriber')
    }
  }

  const transaction = await sequelize.transaction()
  try {
    const newUser = await UserModel.create(
      {
        name: payload.name,
        username: payload.username,
        password: payload.password,
        user_type: userRoles.staff.type,
        status: payload.status ?? 1,
        parent_id: parentId,
      },
      { transaction }
    )

    await replaceUserAccess(
      newUser.id,
      payload,
      parentId,
      transaction
    )

    logger.debug({ user_id: newUser.id }, 'Staff user created')
    await transaction.commit()
    delete newUser.dataValues.password
    return attachAccessFields(newUser)
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

  if (user_type === userRoles.staff.type) {
    filter.parent_id = currentUser.parent_id
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

  if (currentUser) {
    return attachAccessFields(userRecord)
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

  return attachAccessFields(userRecord)
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

  return attachAccessFields(userRecord)
}

const update = async (userId, payload, currentUser) => {
  const userRecord = await userService.getById(userId, currentUser)
  const { role_ids, permission_ids, ...rawFields } = payload
  const userFields = { ...rawFields }
  delete userFields.parent_id
  delete userFields.user_type

  if (currentUser.user_type !== userRoles.admin.type) {
    delete userFields.status
  }

  const transaction = await sequelize.transaction()
  try {
    await userRecord.update(userFields, { transaction })

    const managerId = getAccountOwnerId(currentUser, {
      parent_id: userRecord.parent_id,
    })

    if (role_ids || permission_ids) {
      await replaceUserAccess(
        userRecord.id,
        {
          role_ids: role_ids ?? userRecord.dataValues.role_ids,
          permission_ids:
            permission_ids ?? userRecord.dataValues.permission_ids,
        },
        managerId,
        transaction
      )
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const setPassword = async (userId, newPassword, currentUser) => {
  if (Number(userId) === Number(currentUser.id)) {
    throw new PermissionDeniedError('use profile to change your own password')
  }

  const userRecord = await userService.getById(userId, currentUser)

  if (userRecord.user_type !== userRoles.staff.type) {
    throw new PermissionDeniedError('can only change password for users')
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10)
  await UserModel.update(
    { password: hashedPassword },
    { where: { id: userRecord.id } }
  )

  logger.debug({ user_id: userRecord.id }, 'User password updated')
}

const deleteById = async (userId, currentUser) => {
  const userRecord = await userService.getById(userId, currentUser)
  await userRecord.destroy()
}

const getAll = async (payload = {}, currentUser) => {
  const { limit, page, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (
    currentUser.user_type === userRoles.manager.type ||
    currentUser.user_type === userRoles.staff.type
  ) {
    filter.parent_id = getMasterId(currentUser)
  }

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  if (filter.user_type) {
    filter.user_type = filter.user_type
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
    page,
    limit,
    count,
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
  setPassword,
  delete: deleteById,
  getCompanyNameById,
}

export default userService
