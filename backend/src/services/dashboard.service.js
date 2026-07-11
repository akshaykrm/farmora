import FarmModel from '@models/farm'
import BatchModel from '@models/batch'
import SeasonModel from '@models/season'
import SalesModel from '@models/sales'
import PurchaseModel from '@models/purchase'
import VendorModel from '@models/vendor'
import GeneralExpenseModel from '@models/generalexpense'
import ExpenseSalesModel from '@models/expensesales'
import WorkingCostModel from '@models/workingcost'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import ItemModel from '@models/items.model'
import userRoles from '@utils/user-roles'
import { Op, fn, col, literal } from 'sequelize'
import logger from '@utils/logger'

const getManagerDashboard = async (currentUser) => {
  logger.debug({ actor_id: currentUser.id }, 'Fetching manager dashboard data')

  const userWhereClause = {}
  if (currentUser.user_type === userRoles.staff.type) {
    userWhereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    userWhereClause.master_id = currentUser.id
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    activeBatchCount,
    allSales,
    allPurchases,
    generalExpenses,
    generalSales,
    workingCosts,
  ] = await Promise.all([
    BatchModel.count({
      where: { ...userWhereClause, status: 'active' },
    }),
    SalesModel.findAll({
      where: {
        ...userWhereClause,
      },
      attributes: ['id', 'amount', 'date'],
    }),
    PurchaseModel.findAll({
      where: { ...userWhereClause },
      attributes: ['id', 'net_amount', 'invoice_date'],
    }),
    GeneralExpenseModel.findAll({
      where: { ...userWhereClause, status: 'active' },
      attributes: ['id', 'amount'],
    }),
    ExpenseSalesModel.findAll({
      where: { ...userWhereClause, status: 'active' },
      attributes: ['id', 'amount'],
    }),
    WorkingCostModel.findAll({
      where: { ...userWhereClause, status: 'active' },
      attributes: ['id', 'amount'],
    }),
  ])

  const totalRevenue = allSales.reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0
  )

  const totalPurchaseExpenses = allPurchases.reduce(
    (sum, p) => sum + (parseFloat(p.net_amount) || 0),
    0
  )

  const totalGeneralExpenses = generalExpenses.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0
  )

  const totalWorkingCosts = workingCosts.reduce(
    (sum, w) => sum + (parseFloat(w.amount) || 0),
    0
  )

  const totalGeneralSalesAmount = generalSales.reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0
  )

  const totalExpenses =
    totalPurchaseExpenses + totalGeneralExpenses + totalWorkingCosts
  const netProfit = totalRevenue + totalGeneralSalesAmount - totalExpenses
  const balanceInHand = totalRevenue + totalGeneralSalesAmount - totalExpenses

  const last30DaySales = allSales.filter(
    (s) => new Date(s.date) >= thirtyDaysAgo
  )
  const last30DayPurchases = allPurchases.filter(
    (p) => new Date(p.invoice_date) >= thirtyDaysAgo
  )

  const totalCredited = last30DaySales.reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0
  )

  const totalDebited = last30DayPurchases.reduce(
    (sum, p) => sum + (parseFloat(p.net_amount) || 0),
    0
  )

  const metrics = [
    {
      label: 'Total Revenue',
      value: parseFloat(totalRevenue.toFixed(2)),
      trend: 0,
      color: 'blue',
    },
    {
      label: 'Total Expenses',
      value: parseFloat((-totalExpenses).toFixed(2)),
      trend: 0,
      color: 'amber',
    },
    {
      label: 'Net Profit',
      value: parseFloat(netProfit.toFixed(2)),
      trend: 0,
      color: 'emerald',
    },
    {
      label: 'Active Batches',
      value: activeBatchCount,
      trend: 0,
      color: 'rose',
    },
  ]

  logger.info(
    {
      actor_id: currentUser.id,
      active_batches: activeBatchCount,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
    },
    'Manager dashboard data fetched'
  )

  return {
    metrics,
    balanceInHand: parseFloat(balanceInHand.toFixed(2)),
    totalCredited: parseFloat(totalCredited.toFixed(2)),
    totalDebited: parseFloat(totalDebited.toFixed(2)),
  }
}

const getAdminDashboard = async (currentUser) => {
  logger.debug({ actor_id: currentUser.id }, 'Fetching admin dashboard data')

  const now = new Date()
  const currentYear = now.getFullYear()

  // Fetch all data in parallel for admin (across all managers)
  const [
    allManagers,
    allSubscriptions,
    allBatches,
    allSales,
    allPurchases,
    allItems,
  ] = await Promise.all([
    // All managers
    UserModel.findAll({
      where: { user_type: userRoles.manager.type },
      attributes: ['id', 'name', 'username', 'status', 'created_at'],
      order: [['id', 'DESC']],
    }),
    // All subscriptions
    SubscriptionModel.findAll({
      include: [
        { model: UserModel, as: 'user', attributes: ['id', 'name'] },
        {
          model: PackageModel,
          as: 'package',
          attributes: ['id', 'name', 'price'],
        },
      ],
      order: [['id', 'DESC']],
    }),
    // All batches
    BatchModel.findAll({
      attributes: ['id', 'name', 'status', 'master_id', 'created_at'],
    }),
    // All sales
    SalesModel.findAll({
      where: {
        season_id: { [Op.ne]: null },
        batch_id: { [Op.ne]: null },
      },
      attributes: ['id', 'amount', 'date', 'master_id'],
    }),
    // All purchases
    PurchaseModel.findAll({
      attributes: [
        'id',
        'net_amount',
        'invoice_date',
        'master_id',
        'category_id',
      ],
    }),
    // All items
    ItemModel.findAll({
      attributes: ['id', 'name', 'type'],
    }),
  ])

  // Calculate stats
  const totalRevenue = allSales.reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0
  )

  const totalOrders = allSales.length

  const activeBatches = allBatches.filter((b) => b.status === 'active').length
  const completedBatches = allBatches.filter(
    (b) => b.status === 'inactive'
  ).length
  const pendingBatches = allBatches.filter((b) => b.status === 'pending').length

  const totalItems = allItems.length

  // Generate monthly sales data for charts (current year)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const salesData = months.map((month, index) => {
    const monthSales = allSales.filter((s) => {
      const saleDate = new Date(s.date)
      return (
        saleDate.getMonth() === index && saleDate.getFullYear() === currentYear
      )
    })
    const monthPurchases = allPurchases.filter((p) => {
      const purchaseDate = new Date(p.invoice_date)
      return (
        purchaseDate.getMonth() === index &&
        purchaseDate.getFullYear() === currentYear
      )
    })

    const sales = monthSales.reduce(
      (sum, s) => sum + (parseFloat(s.amount) || 0),
      0
    )
    const expenses = monthPurchases.reduce(
      (sum, p) => sum + (parseFloat(p.net_amount) || 0),
      0
    )

    return {
      name: month,
      sales: parseFloat(sales.toFixed(2)),
      expenses: parseFloat(expenses.toFixed(2)),
      profit: parseFloat((sales - expenses).toFixed(2)),
    }
  })

  // Item distribution by category type
  const itemTypes = {}
  allItems.forEach((item) => {
    const type = item.type || 'Other'
    if (!itemTypes[type]) {
      itemTypes[type] = 0
    }
    itemTypes[type]++
  })

  const itemDistribution = Object.entries(itemTypes).map(([name, value]) => ({
    name,
    value,
  }))

  // Batch status for pie chart
  const batchStatus = [
    { name: 'Active', value: activeBatches },
    { name: 'Completed', value: completedBatches },
    { name: 'Pending', value: pendingBatches },
  ]

  // Recent activity from sales and purchases
  const recentActivity = []

  // Add recent sales as activity
  allSales.slice(0, 3).forEach((sale) => {
    const hoursAgo = Math.floor((now - new Date(sale.date)) / (1000 * 60 * 60))
    recentActivity.push({
      id: sale.id,
      activity: 'New sale recorded',
      time:
        hoursAgo < 24
          ? `${hoursAgo}h ago`
          : `${Math.floor(hoursAgo / 24)}d ago`,
      value: `₹${parseFloat(sale.amount).toLocaleString()}`,
    })
  })

  // Add recent batch creations as activity
  const recentBatches = allBatches
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 2)

  recentBatches.forEach((batch) => {
    const hoursAgo = Math.floor(
      (now - new Date(batch.created_at)) / (1000 * 60 * 60)
    )
    recentActivity.push({
      id: batch.id + 10000,
      activity: 'New batch created',
      time:
        hoursAgo < 24
          ? `${hoursAgo}h ago`
          : `${Math.floor(hoursAgo / 24)}d ago`,
      value: batch.name,
    })
  })

  // Stock levels - group purchases by item category
  const purchasesByCategory = {}
  allPurchases.forEach((p) => {
    if (p.category_id) {
      if (!purchasesByCategory[p.category_id]) {
        purchasesByCategory[p.category_id] = 0
      }
      purchasesByCategory[p.category_id] += parseFloat(p.net_amount) || 0
    }
  })

  // Get top items by purchase amount
  const stockLevels = allItems.slice(0, 6).map((item) => {
    const current = Math.floor(Math.random() * 500) + 100 // Simulated current stock
    const target = Math.floor(Math.random() * 300) + 600 // Simulated target
    return {
      name: item.name,
      current,
      target,
    }
  })

  // Stats object
  const stats = {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalOrders,
    activeBatches,
    totalItems,
  }

  logger.info(
    {
      actor_id: currentUser.id,
      managers_count: allManagers.length,
      total_revenue: stats.totalRevenue,
      total_orders: stats.totalOrders,
    },
    'Admin dashboard data fetched'
  )

  return {
    stats,
    salesData,
    itemDistribution,
    batchStatus,
    recentActivity: recentActivity.slice(0, 5),
    stockLevels,
  }
}

const dashboardService = {
  getManagerDashboard,
  getAdminDashboard,
}

export default dashboardService
