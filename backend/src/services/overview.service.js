import PurchaseModel from '@models/purchase'
import SalesModel from '@models/sales'
import ItemModel from '@models/items.model'
import SeasonModel from '@models/season'
import PurchaseReturnModel from '@models/purchase-return'
import GeneralExpenseModel from '@models/generalexpense'
import ExpenseSalesModel from '@models/expensesales'
import userRoles from '@utils/user-roles'
import batchService from '@services/batch.service'
import seasonService from '@services/season.service'
import { Op } from 'sequelize'
import VendorModel from '@models/vendor'
import BatchModel from '@models/batch'

const isFeedType = (type) => {
  return type === 'BF' || type === 'BS' || type === 'PBS'
}

const calculateTotalFeeds = (records = []) =>
  records
    .filter((record) => isFeedType(record.category?.type))
    .reduce((acc, item) => acc + item.quantity, 0)

const getBatchOverview = async (filter, currentUser) => {
  const { batch_id } = filter

  const userWhereClause = {}
  if (currentUser.user_type === userRoles.staff.type) {
    userWhereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    userWhereClause.master_id = currentUser.id
  }

  const batch = await batchService.getById(batch_id, currentUser, {
    include: [{ model: SeasonModel, as: 'season', required: false }],
  })

  if (!batch) {
    return {
      batch: null,
      expenses: [],
      sales: [],
      returns: [],
    }
  }

  const purchases = await PurchaseModel.findAll({
    where: {
      batch_id: batch_id,
      ...userWhereClause,
    },
    include: [{ model: ItemModel, as: 'category', required: false }],
    order: [['invoice_date', 'ASC']],
  })

  const sales = await SalesModel.findAll({
    where: {
      batch_id: batch_id,
      season_id: { [Op.ne]: null },
      ...userWhereClause,
    },
    order: [['date', 'ASC']],
  })

  const reassigned = await PurchaseReturnModel.findAll({
    where: {
      to_batch: batch_id,
      ...userWhereClause,
    },

    attributes: {
      include: [
        ['rate_per_bag', 'price_per_unit'],
        ['total_amount', 'net_amount'],
      ],
    },

    include: [{ model: ItemModel, as: 'category', required: false }],
    order: [['date', 'ASC']],
  })

  const returns = await PurchaseReturnModel.findAll({
    where: {
      from_batch: batch_id,
      ...userWhereClause,
    },
    include: [
      {
        model: ItemModel,
        as: 'category',
        required: false,
        attributes: ['id', 'type'],
      },
      {
        model: VendorModel,
        as: 'vendor',
        required: false,
        attributes: ['id', 'name'],
      },
      {
        model: BatchModel,
        as: 'to_batch_data',
        required: false,
        attributes: ['id', 'name'],
      },
    ],
    order: [['date', 'DESC']],
  })

  const totalPurchasedFeeds =
    calculateTotalFeeds(purchases) + calculateTotalFeeds(reassigned)

  const totalPurchaseAmount =
    purchases.reduce((acc, curr) => acc + parseFloat(curr.net_amount), 0) +
    reassigned.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0)

  const totalReturnedFeeds = calculateTotalFeeds(returns)

  const totalReturnAmount = returns.reduce(
    (acc, curr) => acc + parseFloat(curr.total_amount),
    0
  )

  const netFeedBags = totalPurchasedFeeds - totalReturnedFeeds

  const netFeedWeight = netFeedBags * 50

  const totalSaleWeight = sales.reduce(
    (acc, curr) => acc + parseFloat(curr.weight),
    0
  )

  const totalSaleBirds = sales.reduce(
    (acc, curr) => acc + parseFloat(curr.bird_no),
    0
  )

  const totalSaleAmount = sales.reduce(
    (acc, curr) => acc + parseFloat(curr.amount),
    0
  )

  const avgWeight = totalSaleWeight / totalSaleBirds

  const FCR = netFeedWeight / totalSaleWeight

  const CFCR = FCR - (avgWeight - 2.0) * 0.25
  return {
    batch: {
      id: batch.id,
      name: batch.name,
      status: batch.status,
      closed_on: batch.closed_on,
      season: batch.season
        ? { id: batch.season.id, name: batch.season.name }
        : null,
    },
    expenses: [
      ...purchases.map((p) => ({
        ...p.get({ plain: true }),
        date: p.invoice_date,
      })),
      ...reassigned,
    ],
    sales,
    returns,
    overviewCalculations: {
      total_purchase_feeds: totalPurchasedFeeds,
      total_purchase_amount: totalPurchaseAmount,
      total_returned_feeds: totalReturnedFeeds,
      total_returned_amount: totalReturnAmount,
      total_sale_weight: totalSaleWeight,
      total_consumed_feed: netFeedWeight,
      total_sale_birds: totalSaleBirds,
      total_sale_amount: totalSaleAmount,
      avg_weight: avgWeight,
      total_expense: totalPurchaseAmount - totalReturnAmount,
      fcr: FCR,
      cfcr: CFCR,
    },
  }
}

const calculateBatchTotals = (batchOverviews = []) => {
  let totalPurchasedFeeds = 0
  let totalPurchaseAmount = 0
  let totalReturnedFeeds = 0
  let totalReturnAmount = 0
  let totalSaleWeight = 0
  let totalSaleBirds = 0
  let totalSaleAmount = 0

  for (const overview of batchOverviews) {
    const data = overview.overviewCalculations

    totalPurchasedFeeds += data.total_purchase_feeds || 0
    totalPurchaseAmount += data.total_purchase_amount || 0
    totalReturnedFeeds += data.total_returned_feeds || 0
    totalReturnAmount += data.total_returned_amount || 0
    totalSaleWeight += data.total_sale_weight || 0
    totalSaleBirds += data.total_sale_birds || 0
    totalSaleAmount += data.total_sale_amount || 0
  }

  const netFeedBags = totalPurchasedFeeds - totalReturnedFeeds

  const netFeedWeight = netFeedBags * 50

  // const totalSaleWeight = sales.reduce(
  //   (acc, curr) => acc + parseFloat(curr.weight),
  //   0
  // )
  //
  // const totalSaleBirds = sales.reduce(
  //   (acc, curr) => acc + parseFloat(curr.bird_no),
  //   0
  // )
  //
  // const totalSaleAmount = sales.reduce(
  //   (acc, curr) => acc + parseFloat(curr.amount),
  //   0
  // )

  const avgWeight = totalSaleWeight / totalSaleBirds

  const FCR = netFeedWeight / totalSaleWeight

  const CFCR = FCR - (avgWeight - 2.0) * 0.25

  return {
    totalPurchasedFeeds,
    totalPurchaseAmount,
    totalReturnedFeeds,
    totalReturnAmount,
    totalSaleWeight,
    totalSaleBirds,
    totalSaleAmount,
    FCR,
    CFCR,
  }
}

const getSeasonOverview = async (filter, currentUser) => {
  const { season_id } = filter

  const userWhereClause = {}
  if (currentUser.user_type === userRoles.staff.type) {
    userWhereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    userWhereClause.master_id = currentUser.id
  }

  const season = await seasonService.getById(season_id, currentUser)
  const batches = await batchService.getBySeasonId(season_id, currentUser)

  const batchOverviews = await Promise.all(
    batches.map((b) => {
      return getBatchOverview({ batch_id: b.id }, currentUser)
    })
  )
  const totals = calculateBatchTotals(batchOverviews)
  const totalAvgWeight = totals.totalSaleWeight / totals.totalSaleBirds
  const totalBatchProfit = batchOverviews.reduce((sum, b) => sum + b.profit, 0)

  const generalExpenses = await GeneralExpenseModel.findAll({
    where: {
      season_id: season_id,
      status: 'active',
      ...userWhereClause,
    },
    order: [['date', 'ASC']],
  })

  const generalSales = await ExpenseSalesModel.findAll({
    where: {
      season_id: season_id,
      status: 'active',
      ...userWhereClause,
    },
    order: [['date', 'ASC']],
  })

  const generalCosts = generalExpenses.map((expense) => ({
    id: expense.id,
    date: expense.date,
    purpose: expense.purpose,
    amount: parseFloat(expense.amount),
  }))

  const generalSalesData = generalSales.map((sale) => ({
    id: sale.id,
    date: sale.date,
    purpose: sale.purpose,
    amount: parseFloat(sale.amount),
  }))

  const totalGeneralCost = generalCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalGeneralSales = generalSalesData.reduce(
    (sum, s) => sum + s.amount,
    0
  )

  const investorProfit = totalBatchProfit - totalGeneralCost + totalGeneralSales
  const totalExpense = totals.totalPurchaseAmount - totals.totalReturnAmount

  const avgCost = totalExpense / totals.totalSaleWeight
  const avgRate = totals.totalSaleAmount / totals.totalSaleWeight
  return {
    season: { id: season.id, name: season.name, closed_on: season.closed_on },
    batches: batchOverviews,
    general_costs: generalCosts,
    general_sales: generalSalesData,
    totals: {
      total_avg_weight: totalAvgWeight,
      fcr: totals.FCR,
      cfcr: totals.CFCR,
      avg_cost: avgCost,
      avg_rate: avgRate,
      profit_loss_percentage: avgRate - avgCost,
      profit: totals.totalSaleAmount - totalExpense,
    },
    summary: {
      total_batch_profit: parseFloat(totalBatchProfit.toFixed(2)),
      total_general_cost: parseFloat(totalGeneralCost.toFixed(2)),
      total_general_sales: parseFloat(totalGeneralSales.toFixed(2)),
      investor_profit: parseFloat(investorProfit.toFixed(2)),
    },
  }
}

const overviewService = {
  getBatchOverview,
  getSeasonOverview,
}

export default overviewService
