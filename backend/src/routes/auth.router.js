import { Router } from 'express'
import { isAuthenticated, isSuperAdmin } from '@middlewares/auth.middleware'
import {
  changePasswordSchema,
  confirmPasswordResetSchema,
  forgotPasswordSchema,
  newManageSchema,
  resetPasswordSchema,
} from '@validators/user.validator'
import authController from '@controllers/auth.controller'
import validate from '@utils/validate-request'

const router = Router()

router.post('/signup', validate(newManageSchema), authController.createManager)

router.post('/login', authController.login)

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

router.post(
  '/forgot-password/reset',
  validate(confirmPasswordResetSchema),
  authController.confirmPasswordReset
)

router.post(
  '/reset-password',
  isAuthenticated,
  isSuperAdmin,
  validate(resetPasswordSchema),
  authController.resetPassword
)

router.post(
  '/change-password',
  isAuthenticated,
  validate(changePasswordSchema),
  authController.changePassword
)

export default router
