import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import userController from '@controllers/user.controller'
import {
  newStaffMemberSchema,
  setUserPasswordSchema,
  updateNewStaffSchema,
  updateProfileSchema,
} from '@validators/user.validator'
import validate from '@utils/validate-request'

const router = Router()

router.use(isAuthenticated)

router.get('/me', userController.getMe)

router.put('/me', validate(updateProfileSchema), userController.updateMe)

router.post(
  '/',
  validate(newStaffMemberSchema),
  requirePermission(P.user_write),
  userController.createStaff
)

router.get('/', requirePermission(P.user_read), userController.getAllUsers)

router.get(
  '/:user_id',
  requirePermission(P.user_read),
  userController.getUserById
)

router.put(
  '/:user_id/password',
  validate(setUserPasswordSchema),
  requirePermission(P.user_edit),
  userController.setPassword
)

router.put(
  '/:user_id',
  validate(updateNewStaffSchema),
  requirePermission(P.user_edit),
  userController.updateUserById
)

router.delete(
  '/:user_id',
  requirePermission(P.user_delete),
  userController.deleteUserById
)

export default router
