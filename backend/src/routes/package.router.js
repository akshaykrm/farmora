import { Router } from 'express'
import packageController from '@controllers/package.controller'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import {
  newPackageSchema,
  updatePackageSchema,
} from '@validators/package.validator'
import validate from '@utils/validate-request'

const router = Router()

router.post(
  '/',
  validate(newPackageSchema),
  isAuthenticated,
  requirePermission(P.package_write),
  packageController.create
)

router.get('/names', packageController.getNames)

router.get('/', packageController.getAll)

router.get('/:package_id', packageController.getById)

router.put(
  '/:package_id',
  validate(updatePackageSchema),
  isAuthenticated,
  requirePermission(P.package_edit),
  packageController.updateById
)

router.delete(
  '/:package_id',
  isAuthenticated,
  requirePermission(P.package_delete),
  packageController.deleteById
)

export default router
