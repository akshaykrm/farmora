import dashboardService from '@services/dashboard.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'
import pendingInvoiceService from '@services/pending-invoice.service'

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

const getPendingInvoices = async (req, res) => {
  const scope = {}
  if (req.query.batch_id) scope.batch_id = parseInt(req.query.batch_id)
  if (req.query.season_id) scope.season_id = parseInt(req.query.season_id)
  const data = await pendingInvoiceService.getPending(scope, req.user)

  res.success(data, {
    message: 'Pending invoices fetched successfully',
  })
}

const dashboardController = {
  getPendingInvoices: asyncHandler(getPendingInvoices),
  getManagerDashboard: asyncHandler(getManagerDashboard),
  getAdminDashboard: asyncHandler(getAdminDashboard),
  getSeasonProfit: asyncHandler(getSeasonProfit),
}

export default dashboardController
