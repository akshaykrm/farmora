import generalExpenseController from '@controllers/general-expense.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import { newGeneralExpenseSchema } from '@validators/general-expense.validator'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.general_expense_read),
  generalExpenseController.getAll
)

router.get(
  '/:id',
  isAuthenticated,
  requirePermission(P.general_expense_read),
  generalExpenseController.getById
)

router.post(
  '/',
  isAuthenticated,
  requirePermission(P.general_expense_write),
  validate(newGeneralExpenseSchema),
  generalExpenseController.create
)

router.put(
  '/:id',
  isAuthenticated,
  requirePermission(P.general_expense_edit),
  validate(newGeneralExpenseSchema),
  generalExpenseController.updateById
)

router.delete(
  '/:id',
  isAuthenticated,
  requirePermission(P.general_expense_delete),
  generalExpenseController.deleteById
)

export default router
