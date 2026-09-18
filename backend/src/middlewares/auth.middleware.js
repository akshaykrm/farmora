import jwt from 'jsonwebtoken'
import userRoles from '@utils/user-roles'
import {
  MissingTokenError,
  PermissionDeniedError,
  UnauthorizedError,
} from '@errors/auth.errors'
import userService from '@services/user.service'
import permissionService, { getMasterId } from '@services/permission.service'
import asyncHandler from '@utils/async-handler'
import CONFIG from '../../config.js'
import { isPlatformPermission } from '../../config/permissions.js'

const { verify } = jwt

export const isAuthenticated = asyncHandler(async function (req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) throw new MissingTokenError()

  const decoded = verify(token, CONFIG.jwt_secret)

  const authenticatedUser = await userService.getById(decoded.id)

  if (!authenticatedUser) {
    throw new MissingTokenError()
  }

  const permissions = await permissionService.resolvePermissionKeys(
    authenticatedUser
  )

  authenticatedUser.master_id = getMasterId(authenticatedUser)
  authenticatedUser.permissions = permissions
  req.user = authenticatedUser
  return next()
})

export const authorize =
  (...allowedRoles) =>
  async (req, res, next) => {
    const role = req.user.user_type
    if (!role) {
      throw new UnauthorizedError()
    }

    if (allowedRoles.includes(role)) {
      return next()
    } else {
      throw new PermissionDeniedError()
    }
  }

export const requirePermission = (...keys) =>
  asyncHandler(async (req, res, next) => {
    const user = req.user
    if (!user) {
      throw new UnauthorizedError()
    }

    if (user.user_type === userRoles.admin.type) {
      return next()
    }

    const denied = keys.some((key) => {
      if (user.user_type === userRoles.manager.type) {
        return isPlatformPermission(key)
      }
      return !(user.permissions || []).includes(key)
    })

    if (denied) {
      throw new PermissionDeniedError()
    }

    return next()
  })

export const isManagerOrAdmin = asyncHandler(
  authorize(userRoles.admin.type, userRoles.manager.type)
)

export const isSuperAdmin = asyncHandler(authorize(userRoles.admin.type))
