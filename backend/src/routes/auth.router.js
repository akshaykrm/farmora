import { Router } from 'express'
import {
  newManageSchema,
  resetPasswordSchema,
} from '@validators/user.validator'
import authController from '@controllers/auth.controller'
import validate from '@utils/validate-request'

const router = Router()

router.post('/signup', validate(newManageSchema), authController.createManager)

router.post('/login', authController.login)

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
)

export default router
