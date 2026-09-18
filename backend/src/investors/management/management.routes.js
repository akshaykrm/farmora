import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../../config/permissions.js'
import { Router } from 'express'
import InvestorManagementController from './management.controller'
import validate from '@utils/validate-request'
import {
  createInvestorManagementValidation,
  updateInvestorManagementValidation,
} from './management.validation'

const router = Router()

router.post(
  '/',
  validate(createInvestorManagementValidation),
  isAuthenticated,
  requirePermission(P.investor_write),
  InvestorManagementController.createInvestor
)

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.investor_read),
  InvestorManagementController.getAllInvestors
)

router.get(
  '/:investor_id',
  isAuthenticated,
  requirePermission(P.investor_read),
  InvestorManagementController.getInvestorById
)

router.put(
  '/:investor_id',
  validate(updateInvestorManagementValidation),
  isAuthenticated,
  requirePermission(P.investor_edit),
  InvestorManagementController.updateInvestor
)

router.patch(
  '/:investor_id/toggle-status',
  isAuthenticated,
  requirePermission(P.investor_delete),
  InvestorManagementController.toggleInvestorStatus
)

export default router
