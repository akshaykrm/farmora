import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import salesController from '@controllers/sales.controller'
import validate from '@utils/validate-request'
import {
  newSaleSchema,
  updateSaleSchema,
  addSalesBookEntrySchema,
} from '@validators/sales.validator'

const router = Router()

router.post(
  '/',
  validate(newSaleSchema),
  isAuthenticated,
  requirePermission(P.sale_write),
  salesController.create
)

router.post(
  '/ledger',
  validate(addSalesBookEntrySchema),
  isAuthenticated,
  requirePermission(P.sales_book_write),
  salesController.addSalesBookEntry
)
router.get(
  '/ledger',
  isAuthenticated,
  requirePermission(P.sales_book_read),
  salesController.getSalesLedger
)
router.get(
  '/',
  isAuthenticated,
  requirePermission(P.sale_read),
  salesController.getAll
)
router.get(
  '/:sale_id',
  isAuthenticated,
  requirePermission(P.sale_read),
  salesController.getById
)
router.put(
  '/:sale_id',
  validate(updateSaleSchema),
  isAuthenticated,
  requirePermission(P.sale_edit),
  salesController.updateById
)
router.delete(
  '/:sale_id',
  isAuthenticated,
  requirePermission(P.sale_delete),
  salesController.deleteById
)

export default router
