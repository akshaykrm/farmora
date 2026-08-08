import dashboardService from '@services/dashboard.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'

const getManagerDashboard = async (req, res) => {
  logger.info({ actor_id: req.user.id }, 'Manager dashboard request received')
  const dashboardData = await dashboardService.getManagerDashboard(req.user)

  res.success(dashboardData, {
    message: 'Manager dashboard data fetched successfully',
  })
}

const getAdminDashboard = async (req, res) => {
  logger.info({ actor_id: req.user.id }, 'Admin dashboard request received')
  const dashboardData = await dashboardService.getAdminDashboard(req.user)

  res.success(dashboardData, {
    message: 'Admin dashboard data fetched successfully',
  })
}

const getSeasonProfit = async (req, res) => {
  logger.info({ actor_id: req.user.id }, 'Season profit request received')
  const data = await dashboardService.getSeasonProfit(req.query, req.user)

  res.success(data, {
    message: 'Season profit data fetched successfully',
  })
}

const dashboardController = {
  getManagerDashboard: asyncHandler(getManagerDashboard),
  getAdminDashboard: asyncHandler(getAdminDashboard),
  getSeasonProfit: asyncHandler(getSeasonProfit),
}

export default dashboardController
