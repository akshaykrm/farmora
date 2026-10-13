import purchaseController from '@controllers/purchase.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate, { validateQuery } from '@utils/validate-request'
import expenseExportController from '@controllers/expense-export.controller'
import {
  exportQuerySchema,
  purchaseBookExportQuerySchema,
} from '@validators/export.validator'
import {
  newItemSchema,
  updateItemsSchema,
  assignItemToBatchSchema,
  reassignItemToBatchSchema,
} from '@validators/items.validator'

import { Router } from 'express'

const router = Router()
router.use(isAuthenticated)

router.post(
  '/',
  requirePermission(P.purchase_write),
  validate(newItemSchema),
  purchaseController.create
)
router.get('/', requirePermission(P.purchase_read), purchaseController.getAll)
router.get(
  '/export',
  requirePermission(P.purchase_read, P.purchase_export),
  validateQuery(exportQuerySchema),
  expenseExportController.purchases
)
router.get(
  '/purchase-book',
  requirePermission(P.purchase_book_read),
  purchaseController.getPurchaseBook
)
router.get(
  '/purchase-book/export',
  requirePermission(P.purchase_book_read, P.purchase_book_export),
  validateQuery(purchaseBookExportQuerySchema),
  expenseExportController.purchaseBook
)

router.get(
  '/:item_id',
  requirePermission(P.purchase_read),
  purchaseController.getById
)

router.put(
  '/item-batch-assign',
  validate(assignItemToBatchSchema),
  requirePermission(P.purchase_edit),
  purchaseController.assingItemToBatch
)
router.put(
  '/item-batch-reassign',
  validate(reassignItemToBatchSchema),
  requirePermission(P.purchase_edit),
  purchaseController.reassignItemToBatch
)

router.put(
  '/:item_id',
  requirePermission(P.purchase_edit),
  validate(updateItemsSchema),
  purchaseController.updateById
)

router.delete(
  '/:item_id',
  requirePermission(P.purchase_delete),
  purchaseController.deleteById
)

export default router
