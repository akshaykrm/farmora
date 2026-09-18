import workingCostController from '@controllers/working-cost.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import { newWorkingCostSchema } from '@validators/working-cost.validator'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.working_cost_read),
  workingCostController.getAll
)

router.post(
  '/',
  isAuthenticated,
  requirePermission(P.working_cost_write),
  validate(newWorkingCostSchema),
  workingCostController.create
)

export default router
