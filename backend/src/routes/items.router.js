import itemController from '@controllers/items.controller'
import purchaseController from '@controllers/purchase.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import {
  newItemSchema,
  updateItemsCategory,
  newItemCategory,
  updateItemsSchema,
  assignItemToBatchSchema,
  reassignItemToBatchSchema,
  purchaseBookSchema,
} from '@validators/items.validator'
import { Router } from 'express'

const router = Router()
router.use(isAuthenticated)

router.get(
  '/categories',
  requirePermission(P.item_read),
  itemController.getAll
)
router.post(
  '/categories',
  requirePermission(P.item_write),
  validate(newItemCategory),
  itemController.create
)

router.get(
  '/categories/names',
  requirePermission(P.item_read),
  itemController.getNames
)

router.get(
  '/categories/names/:vendor_id',
  requirePermission(P.item_read),
  itemController.getItemsByVendorId
)

router.get(
  '/categories/:item_category_id',
  requirePermission(P.item_read),
  itemController.getById
)
router.put(
  '/categories/:item_category_id',
  requirePermission(P.item_edit),
  validate(updateItemsCategory),
  itemController.updateById
)
router.delete(
  '/categories/:item_category_id',
  requirePermission(P.item_delete),
  itemController.deleteById
)

router.post(
  '/',
  requirePermission(P.purchase_write),
  validate(newItemSchema),
  purchaseController.create
)
router.get('/', requirePermission(P.purchase_read), purchaseController.getAll)
router.get(
  '/purchase-book',
  requirePermission(P.purchase_book_read),
  purchaseController.getPurchaseBook
)

router.post(
  '/purchase-book',
  requirePermission(P.purchase_book_write),
  validate(purchaseBookSchema),
  purchaseController.createPurchaseBookEntry
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

router.get(
  '/:item_id',
  requirePermission(P.purchase_read),
  purchaseController.getById
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
