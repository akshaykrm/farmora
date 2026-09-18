import {
  isAuthenticated,
  isSuperAdmin,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import dashboardController from '@controllers/dashboard.controller'

const router = Router()

router.get(
  '/manager/season-profit',
  isAuthenticated,
  requirePermission(P.dashboard_read),
  dashboardController.getSeasonProfit
)

router.get(
  '/manager',
  isAuthenticated,
  requirePermission(P.dashboard_read),
  dashboardController.getManagerDashboard
)

router.get(
  '/admin',
  isAuthenticated,
  isSuperAdmin,
  dashboardController.getAdminDashboard
)

export default router
