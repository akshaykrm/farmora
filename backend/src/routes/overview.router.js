import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import overviewController from '@controllers/overview.controller'

const router = Router()

router.get(
  '/batch',
  isAuthenticated,
  requirePermission(P.batch_overview_read),
  overviewController.getBatchOverview
)

router.get(
  '/season',
  isAuthenticated,
  requirePermission(P.season_overview_read),
  overviewController.getSeasonOverview
)

export default router
