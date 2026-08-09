import BatchModel from '@models/batch'
import SalesModel from '@models/sales'
import PurchaseModel from '@models/purchase'
import PurchaseReturnModel from '@models/purchase-return'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import ItemModel from '@models/items.model'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import logger from '@utils/logger'
import dayjs from 'dayjs'
import { getAllPurchaseWithBatchActive } from '@services/purchase.service'
import {
  getAllClosedBatches,
  getAllActiveBatches,
  getAllBySeasonId,
} from '@services/batch.service'
import { getAllReturnsWithBatchActive } from '@services/purchase-return.service'
import overviewService from '@services/overview.service'
import balanceSheetService from '@services/balance-sheet.service'
import vendorService from '@services/vendor.service'
import salesService from '@services/sales.service'
import purchaseService from '@services/purchase.service'
import farmService from '@services/farm.service'
import seasonService from '@services/season.service'
import integrationBookService from '@services/itegration-book.service'
import workingCostService from '@services/working-cost.service'

function calculateTotalStockValue(purchaseItems, returnedItems) {
  let expenseTotal = 0
  let returnedTotal = 0

  let totalPurchasedChicks = 0
  let totalReturnedChicks = 0

  for (const p of purchaseItems) {
    if (p.category.type === 'chick') {
      totalPurchasedChicks += p.quantity
    }
    expenseTotal += parseFloat(p.net_amount)
  }

  for (const p of returnedItems) {
    if (p.category.type === 'chick') {
      totalReturnedChicks += p.quantity
    }
    returnedTotal += parseFloat(p.total_amount)
  }

  return {
    stock: expenseTotal - returnedTotal,
    chicks: totalPurchasedChicks - totalReturnedChicks,
  }
}

async function getAverageProfitFromClosedBatches(
  closedBatchNames,
  currentUser
) {
  let totalProfit = 0
  let totalWeight = 0
  let totalConsumedFeed = 0

  for (const b of closedBatchNames) {
    const { overviewCalculations: res } =
      await overviewService.getBatchOverview({ batch_id: b.id }, currentUser)

    totalProfit +=
      parseFloat(res.total_sale_amount) - parseFloat(res.total_expense)
    totalWeight += parseFloat(res.total_sale_weight)
    totalConsumedFeed += parseFloat(res.total_consumed_feed)
  }

  return {
    averageProfit: totalProfit / totalWeight,
    averageFCR: totalConsumedFeed / totalWeight,
  }
}

const getSeasonProfit = async (filter, currentUser) => {
  const { season_id } = filter

  const season = await seasonService.getById(season_id, currentUser)
  const batches = await getAllBySeasonId(season_id, currentUser)

  const batchIds = batches.map((b) => b.id)

  const userWhereClause = {}
  if (currentUser.user_type === userRoles.staff.type) {
    userWhereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    userWhereClause.master_id = currentUser.id
  }

  const [sales, purchases, reassignedIn, returnsOut] = await Promise.all([
    SalesModel.findAll({
      where: {
        batch_id: { [Op.in]: batchIds },
        season_id: { [Op.ne]: null },
        ...userWhereClause,
      },
      attributes: ['batch_id', 'amount', 'date'],
    }),
    PurchaseModel.findAll({
      where: {
        batch_id: { [Op.in]: batchIds },
        ...userWhereClause,
      },
      attributes: ['batch_id', 'net_amount', 'invoice_date'],
    }),
    PurchaseReturnModel.findAll({
      where: {
        to_batch: { [Op.in]: batchIds },
        ...userWhereClause,
      },
      attributes: ['to_batch', 'total_amount', 'date'],
    }),
    PurchaseReturnModel.findAll({
      where: {
        from_batch: { [Op.in]: batchIds },
        ...userWhereClause,
      },
      attributes: ['from_batch', 'total_amount', 'date'],
    }),
  ])

  const earliestDate = [
    ...sales.map((s) => s.date),
    ...purchases.map((p) => p.invoice_date),
    ...reassignedIn.map((r) => r.date),
    ...returnsOut.map((r) => r.date),
    ...batches.map((b) => b.created_at),
  ]
    .filter(Boolean)
    .map((d) => dayjs(d))
    .sort((a, b) => a.valueOf() - b.valueOf())[0]

  const startDate = (season.from_date
    ? dayjs(season.from_date)
    : earliestDate || dayjs()
  ).startOf('month')
  const endDate = (season.to_date ? dayjs(season.to_date) : dayjs()).startOf(
    'month'
  )

  const monthKeys = []
  let cursor = startDate
  while (cursor.isSame(endDate) || cursor.isBefore(endDate)) {
    monthKeys.push(cursor.format('YYYY-MM'))
    cursor = cursor.add(1, 'month')
  }

  if (monthKeys.length === 0) {
    monthKeys.push(dayjs().format('YYYY-MM'))
  }

  const profitByMonth = {}
  for (const key of monthKeys) {
    profitByMonth[key] = {}
  }

  sales.forEach((s) => {
    const key = dayjs(s.date).format('YYYY-MM')
    if (!profitByMonth[key]) return
    profitByMonth[key][s.batch_id] =
      (profitByMonth[key][s.batch_id] || 0) + parseFloat(s.amount)
  })

  purchases.forEach((p) => {
    const key = dayjs(p.invoice_date).format('YYYY-MM')
    if (!profitByMonth[key]) return
    profitByMonth[key][p.batch_id] =
      (profitByMonth[key][p.batch_id] || 0) - parseFloat(p.net_amount)
  })

  reassignedIn.forEach((r) => {
    const key = dayjs(r.date).format('YYYY-MM')
    if (!profitByMonth[key]) return
    profitByMonth[key][r.to_batch] =
      (profitByMonth[key][r.to_batch] || 0) - parseFloat(r.total_amount)
  })

  returnsOut.forEach((r) => {
    const key = dayjs(r.date).format('YYYY-MM')
    if (!profitByMonth[key]) return
    profitByMonth[key][r.from_batch] =
      (profitByMonth[key][r.from_batch] || 0) + parseFloat(r.total_amount)
  })

  const series = monthKeys.map((key) => {
    const row = { month: dayjs(key).format('MMM YY') }
    batches.forEach((b) => {
      const value = profitByMonth[key][b.id] || 0
      row[b.id] = parseFloat(value.toFixed(2))
    })
    return row
  })

  const batchProfit = batches.map((b) => {
    const total = monthKeys.reduce(
      (sum, key) => sum + (profitByMonth[key][b.id] || 0),
      0
    )
    return {
      id: b.id,
      name: b.name,
      profit: parseFloat(total.toFixed(2)),
    }
  })

  return {
    season: {
      id: season.id,
      name: season.name,
      from_date: season.from_date,
      to_date: season.to_date,
    },
    batches: batches.map((b) => ({ id: b.id, name: b.name })),
    series,
    batchProfit,
  }
}

const getManagerDashboard = async (currentUser) => {
  try {
    logger.debug(
      { actor_id: currentUser.id },
      'Fetching manager dashboard data'
    )

    const userWhereClause = {}
    if (currentUser.user_type === userRoles.staff.type) {
      userWhereClause.master_id = currentUser.master_id
    } else if (currentUser.user_type === userRoles.manager.type) {
      userWhereClause.master_id = currentUser.id
    }

    // Total Stock Value
    const activePurchase = await getAllPurchaseWithBatchActive(userWhereClause)
    const activeReturns = await getAllReturnsWithBatchActive(userWhereClause)

    const activeTotals = calculateTotalStockValue(activePurchase, activeReturns)

    // Average Profit & avarage fcr
    const closedBatches = await getAllClosedBatches(userWhereClause)
    const activeBatches = await getAllActiveBatches(userWhereClause)

    let totalExpence = 0
    for (const b of activeBatches) {
      const { overviewCalculations: res } =
        await overviewService.getBatchOverview({ batch_id: b.id }, currentUser)

      totalExpence += res.total_expense
    }

    const closedTotals = await getAverageProfitFromClosedBatches(
      closedBatches,
      currentUser
    )

    const metrics = [
      {
        label: 'Total Stock Values',
        value: totalExpence,
        trend: 0,
        color: 'blue',
        unit: '₹',
        decimals: 2,
      },
      {
        label: 'Average Profit',
        value: closedTotals.averageProfit,
        trend: 0,
        color: 'amber',
        unit: '₹/kg',
        decimals: 2,
      },
      {
        label: 'Avarage FCR',
        value: closedTotals.averageFCR,
        trend: 0,
        color: 'emerald',
        unit: '',
        decimals: 2,
      },
      {
        label: 'Active Batches',
        value: activeBatches?.length || 0,
        trend: 0,
        color: 'rose',
        unit: 'Batches',
        decimals: 0,
        subtitle: `${activeTotals.chicks} Chicks`,
      },
    ]

    let supplierBalance = 0
    let customerBalance = 0

    supplierBalance += await getIntegrationBalance(currentUser)
    supplierBalance += await getWorkingBalance(currentUser)

    const vendors = await vendorService.getNames({}, currentUser)
    for (const v of vendors) {
      if (v.vendor_type === 'supplier') {
        supplierBalance += await getSupplierBalance(v, currentUser)
      } else if (v.vendor_type === 'customer') {
        customerBalance += await getCustomerBalance(v, currentUser)
      }
    }

    const recentPurchases = await purchaseService.getAll(
      { limit: 10 },
      currentUser
    )

    const parsedPurchases = recentPurchases.data.map((r) => {
      return {
        id: r.id,
        invoice_number: r.invoice_number,
        invoice_date: r.invoice_date,
        amount: r.net_amount,
        supplier_name: r.vendor.name,
        quantity: r.quantity,
        type: r.category.type,
      }
    })

    const recentSales = await salesService.getAll({ limit: 10 }, currentUser)

    const parsedSales = recentSales.data.map((r) => {
      return {
        id: r.id,
        date: r.date,
        batch: r.batch?.name || '-',
        buyer: r.buyer?.name || '-',
        weight: r.weight,
        birds: r.bird_no,
        amount: r.amount,
        payment_type: r.payment_type,
      }
    })

    return {
      metrics,
      balanceInHand: await getBalanceInHand(currentUser),
      customerBalance: customerBalance,
      supplierBalance: supplierBalance,
      recentPurchases: parsedPurchases,
      recentSales: parsedSales,
    }
  } catch (err) {
    console.log(err)
    return {}
  }
}

async function getWorkingBalance(currentUser) {
  let balance = 0
  const seasonNames = await seasonService.getNames(currentUser, {})
  for (const s of seasonNames) {
    const res = await workingCostService.getAll(
      { season_id: s.id },
      currentUser
    )
    balance += res.summary.balance
  }

  return balance
}

async function getIntegrationBalance(currentUser) {
  let balance = 0
  const farmNames = await farmService.getNames(currentUser)
  for (const f of farmNames) {
    const res = await integrationBookService.getAll(
      { farm_id: f.id },
      currentUser
    )
    balance += res.summary.balance
  }

  return balance
}

async function getSupplierBalance(supplier, currentUser) {
  const res = await purchaseService.getPurchaseBook(
    { vendor_id: supplier.id },
    currentUser
  )
  return res.summary.balance
}

async function getCustomerBalance(customer, currentUser) {
  const res = await salesService.getSalesLedger(
    { buyer_id: customer.id },
    currentUser
  )
  return res.summary.closing_balance
}

async function getBalanceInHand(currentUser) {
  const cashBalance = await balanceSheetService.getBalanceSheet({}, currentUser)
  const { total_in, total_out } = cashBalance.summary

  const balanceInHand = total_in - total_out
  return balanceInHand
}

const getAdminDashboard = async (currentUser) => {
  logger.debug({ actor_id: currentUser.id }, 'Fetching admin dashboard data')

  const now = new Date()
  const currentYear = now.getFullYear()

  // Fetch all data in parallel for admin (across all managers)
  const [allManagers, allBatches, allSales, allPurchases, allItems] =
    await Promise.all([
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
  getSeasonProfit,
}

export default dashboardService
