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
import validate, { validateQuery } from '@utils/validate-request'
import configExportController from '@controllers/config-export.controller'
import platformExportController from '@controllers/platform-export.controller'
import { exportQuerySchema } from '@validators/export.validator'

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
  '/export',
  requirePermission(P.user_read, P.user_export),
  validateQuery(exportQuerySchema),
  configExportController.users
)

router.get(
  '/subscribers/export',
  requirePermission(P.subscriber_read, P.subscriber_export),
  validateQuery(exportQuerySchema),
  platformExportController.subscribers
)

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
