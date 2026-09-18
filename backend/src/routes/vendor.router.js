import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import vendorController from '@controllers/vendor.controller'
import validate from '@utils/validate-request'
import {
  newVendorSchema,
  updateVendorSchema,
} from '@validators/vendor.validator'

const router = Router()

router.post(
  '/',
  validate(newVendorSchema),
  isAuthenticated,
  requirePermission(P.vendor_write),
  vendorController.create
)

router.get(
  '/names',
  isAuthenticated,
  requirePermission(P.vendor_read),
  vendorController.getNames
)

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.vendor_read),
  vendorController.getAll
)
router.get(
  '/:vendor_id',
  isAuthenticated,
  requirePermission(P.vendor_read),
  vendorController.getById
)
router.put(
  '/:vendor_id',
  validate(updateVendorSchema),
  isAuthenticated,
  requirePermission(P.vendor_edit),
  vendorController.updateById
)
router.delete(
  '/:vendor_id',
  isAuthenticated,
  requirePermission(P.vendor_delete),
  vendorController.deleteById
)

export default router
