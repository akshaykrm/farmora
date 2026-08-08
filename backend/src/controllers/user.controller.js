import userService from '@services/user.service'
import asyncHandler from '@utils/async-handler'

const createStaff = async (req, res) => {
  const user = await userService.createStaff(req.body, req.user)
  res.success(user, { message: 'user created', statusCode: 201 })
}

const getAllUsers = async (req, res) => {
  const { status, name, parent_id, page, limit } = req.query
  const filter = {
    page: page ? parseInt(req.query.page) : 1,
    limit: limit ? parseInt(req.query.limit) : 10,
  }

  if (status) {
    filter.status = parseInt(status)
  }

  if (name) {
    filter.name = name
  }

  if (parent_id) {
    filter.parent_id = parent_id
  }

  const result = await userService.getAll(filter, req.user)

  res.success(result, { message: 'users list' })
}

const getUserById = async (req, res) => {
  const { user_id } = req.params

  const userRecord = await userService.getById(user_id, req.user)
  res.success(userRecord, { message: 'users record' })
}

const updateUserById = async (req, res) => {
  const { user_id } = req.params
  await userService.update(user_id, req.body, req.user)
  res.success(null, { message: 'user updated' })
}

const deleteUserById = async (req, res) => {
  const { user_id } = req.params
  await userService.delete(user_id, req.user)
  res.success(null, { message: 'user deleted' })
}

const getMe = async (req, res) => {
  const userRecord = await userService.getMe(req.user.id)
  res.success(userRecord, { message: 'profile fetched' })
}

const updateMe = async (req, res) => {
  const userRecord = await userService.updateMe(req.user.id, req.body)
  res.success(userRecord, { message: 'profile updated' })
}

const userController = {
  createStaff: asyncHandler(createStaff),
  getAllUsers: asyncHandler(getAllUsers),
  getUserById: asyncHandler(getUserById),
  updateUserById: asyncHandler(updateUserById),
  deleteUserById: asyncHandler(deleteUserById),
  getMe: asyncHandler(getMe),
  updateMe: asyncHandler(updateMe),
}

export default userController
