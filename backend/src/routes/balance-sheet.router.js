import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import balanceSheetController from '@controllers/balance-sheet.controller'
import salesExportController from '@controllers/sales-export.controller'
import { validateQuery } from '@utils/validate-request'
import { exportQuerySchema } from '@validators/export.validator'

const router = Router()

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.cash_flow_read),
  balanceSheetController.getBalanceSheet
)

router.get(
  '/export',
  isAuthenticated,
  requirePermission(P.cash_flow_read, P.cash_flow_export),
  validateQuery(exportQuerySchema),
  salesExportController.cashFlow
)

export default router
