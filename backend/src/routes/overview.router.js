import { isAuthenticated, isManagerOrAdmin } from '@middlewares/auth.middleware'
import { Router } from 'express'
import overviewController from '@controllers/overview.controller'

const router = Router()

router.get(
  '/batch',
  isAuthenticated,
  isManagerOrAdmin,
  overviewController.getBatchOverview
)

router.get(
  '/season',
  isAuthenticated,
  isManagerOrAdmin,
  overviewController.getSeasonOverview
)

export default router
