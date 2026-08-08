import {
  isAuthenticated,
  isManagerOrAdmin,
  isSuperAdmin,
} from '@middlewares/auth.middleware'
import { Router } from 'express'
import dashboardController from '@controllers/dashboard.controller'

const router = Router()

router.get(
  '/manager/season-profit',
  isAuthenticated,
  isManagerOrAdmin,
  dashboardController.getSeasonProfit
)

router.get(
  '/manager',
  isAuthenticated,
  isManagerOrAdmin,
  dashboardController.getManagerDashboard
)

router.get(
  '/admin',
  isAuthenticated,
  isSuperAdmin,
  dashboardController.getAdminDashboard
)

export default router
