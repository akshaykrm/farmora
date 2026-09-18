import expenseSalesController from '@controllers/expense-sales.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import { newExpenseSalesSchema } from '@validators/expense-sales.validator'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.general_sales_read),
  expenseSalesController.getAll
)

router.get(
  '/:id',
  isAuthenticated,
  requirePermission(P.general_sales_read),
  expenseSalesController.getById
)

router.post(
  '/',
  isAuthenticated,
  requirePermission(P.general_sales_write),
  validate(newExpenseSalesSchema),
  expenseSalesController.create
)

router.put(
  '/:id',
  isAuthenticated,
  requirePermission(P.general_sales_edit),
  validate(newExpenseSalesSchema),
  expenseSalesController.updateById
)

router.delete(
  '/:id',
  isAuthenticated,
  requirePermission(P.general_sales_delete),
  expenseSalesController.deleteById
)

export default router
