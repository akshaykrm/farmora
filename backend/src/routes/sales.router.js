import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import salesController from '@controllers/sales.controller'
import validate, { validateQuery } from '@utils/validate-request'
import salesExportController from '@controllers/sales-export.controller'
import {
  exportQuerySchema,
  salesBookExportQuerySchema,
} from '@validators/export.validator'
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
  '/ledger/export',
  isAuthenticated,
  requirePermission(P.sales_book_read, P.sales_book_export),
  validateQuery(salesBookExportQuerySchema),
  salesExportController.salesBook
)
router.get(
  '/',
  isAuthenticated,
  requirePermission(P.sale_read),
  salesController.getAll
)
router.get(
  '/export',
  isAuthenticated,
  requirePermission(P.sale_read, P.sale_export),
  validateQuery(exportQuerySchema),
  salesExportController.sales
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
