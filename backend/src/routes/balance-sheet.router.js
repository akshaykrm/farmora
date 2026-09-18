import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import balanceSheetController from '@controllers/balance-sheet.controller'

const router = Router()

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.cash_flow_read),
  balanceSheetController.getBalanceSheet
)

export default router
