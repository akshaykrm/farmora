import { generateToken, generateCheckoutToken } from '@utils/jwt'
import asyncHandler from '@utils/async-handler'
import authService from '@services/auth.service'
import permissionService, { getMasterId } from '@services/permission.service'

const createManager = async (req, res) => {
  const user = await authService.createManager(req.body)
  const safeUser = user.toJSON()
  delete safeUser.password
  res.success(
    {
      ...safeUser,
      checkout_token: user.getDataValue('checkout_required')
        ? generateCheckoutToken(user)
        : null,
    },
    { message: 'user created', statusCode: 201 }
  )
}

const login = async (req, res) => {
  const { username, password } = req.body
  const user = await authService.login(username, password)
  if (user.getDataValue('checkout_required')) {
    return res.success(
      { checkout_required: true, checkout_token: generateCheckoutToken(user) },
      { message: 'Complete package checkout to continue' }
    )
  }
  const permissions = await permissionService.resolvePermissionKeys(user)

  const responseObject = {
    token: generateToken(user),
    master_id: getMasterId(user),
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    user_type: user.user_type,
    parent_id: user.parent_id,
    permissions,
  }

  res.success(responseObject, { message: 'user authenticated' })
}
const resetPassword = async (req, res) => {
  const { username, new_password } = req.body
  await authService.resetPassword(username, new_password)
  res.success(null, { message: 'Password reset successfully' })
}

const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body
  await authService.changePassword(req.user.id, current_password, new_password)
  res.success(null, { message: 'Password updated successfully' })
}

const authController = {
  createManager: asyncHandler(createManager),
  login: asyncHandler(login),
  resetPassword: asyncHandler(resetPassword),
  changePassword: asyncHandler(changePassword),
}

export default authController
