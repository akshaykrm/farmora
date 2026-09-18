import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import roleController from '@controllers/role.controller'

const router = Router()

router.post(
  '/',
  isAuthenticated,
  requirePermission(P.role_write),
  roleController.createRole
)
router.get(
  '/',
  isAuthenticated,
  requirePermission(P.role_read),
  roleController.getAllRoles
)
router.get(
  '/:role_id',
  isAuthenticated,
  requirePermission(P.role_read),
  roleController.getRoleById
)
router.put(
  '/:role_id',
  isAuthenticated,
  requirePermission(P.role_edit),
  roleController.updateRoleById
)
router.delete(
  '/:role_id',
  isAuthenticated,
  requirePermission(P.role_delete),
  roleController.deleteRoleById
)

export default router
