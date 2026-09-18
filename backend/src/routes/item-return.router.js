import purchaseReturnController from '@controllers/purchase-return.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import {
  newItemReturnSchema,
  updateItemReturnSchema,
} from '@validators/item-return.validator'
import { Router } from 'express'

const router = Router()
router.use(isAuthenticated)

router.post(
  '/',
  requirePermission(P.item_return_write),
  validate(newItemReturnSchema),
  purchaseReturnController.create
)

router.get(
  '/',
  requirePermission(P.item_return_read),
  purchaseReturnController.getAll
)

router.get(
  '/:item_return_id',
  requirePermission(P.item_return_read),
  purchaseReturnController.getById
)

router.put(
  '/:item_return_id',
  requirePermission(P.item_return_edit),
  validate(updateItemReturnSchema),
  purchaseReturnController.updateById
)

router.delete(
  '/:item_return_id',
  requirePermission(P.item_return_delete),
  purchaseReturnController.deleteById
)

export default router
