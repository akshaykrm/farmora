import { generateToken, generateCheckoutToken } from '@utils/jwt'
import asyncHandler from '@utils/async-handler'
import authService from '@services/auth.service'
import passwordResetService, {
  GENERIC_RESET_MESSAGE,
} from '@services/password-reset.service'
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

const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.ip || req.socket?.remoteAddress || null
}

const forgotPassword = async (req, res) => {
  await passwordResetService.requestReset(req.body.identifier, clientIp(req))
  res.success(null, { message: GENERIC_RESET_MESSAGE })
}

const confirmPasswordReset = async (req, res) => {
  const { token, new_password } = req.body
  await passwordResetService.confirmReset(token, new_password)
  res.success(null, { message: 'Password updated. You can now sign in.' })
}

const authController = {
  createManager: asyncHandler(createManager),
  login: asyncHandler(login),
  resetPassword: asyncHandler(resetPassword),
  changePassword: asyncHandler(changePassword),
  forgotPassword: asyncHandler(forgotPassword),
  confirmPasswordReset: asyncHandler(confirmPasswordReset),
}

export default authController
