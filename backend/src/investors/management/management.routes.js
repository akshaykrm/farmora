import { isAuthenticated, isManagerOrAdmin } from '@middlewares/auth.middleware'
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
  isManagerOrAdmin,
  InvestorManagementController.createInvestor
)

router.get(
  '/',
  isAuthenticated,
  isManagerOrAdmin,
  InvestorManagementController.getAllInvestors
)

router.get(
  '/:investor_id',
  isAuthenticated,
  isManagerOrAdmin,
  InvestorManagementController.getInvestorById
)

router.put(
  '/:investor_id',
  validate(updateInvestorManagementValidation),
  isAuthenticated,
  isManagerOrAdmin,
  InvestorManagementController.updateInvestor
)

router.patch(
  '/:investor_id/toggle-status',
  isAuthenticated,
  isManagerOrAdmin,
  InvestorManagementController.toggleInvestorStatus
)

export default router
