import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import invoiceConfigController from '@controllers/invoice_config.controller'

const router = Router()

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.invoice_read),
  invoiceConfigController.handleGetNextInvoiceNumberByUserId
)

export default router
