import { isAuthenticated, isManagerOrAdmin } from '@middlewares/auth.middleware'
import { Router } from 'express'
import overviewController from '@controllers/overview.controller'
import validateQuery from '@utils/validate-query'
import { seasonOverviewSchema } from '@validators/overview.validator'

const router = Router()

router.get(
  '/batch',
  isAuthenticated,
  isManagerOrAdmin,
  overviewController.getBatchOverview
)

router.get(
  '/season',
  validateQuery(seasonOverviewSchema),
  isAuthenticated,
  isManagerOrAdmin,
  overviewController.getSeasonOverview
)

export default router
