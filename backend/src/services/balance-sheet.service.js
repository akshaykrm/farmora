import PurchaseModel from '@models/purchase'
import SalesModel from '@models/sales'
import VendorModel from '@models/vendor'
import WorkingCostModel from '@models/workingcost'
import GeneralExpenseModel from '@models/generalexpense'
import ExpenseSalesModel from '@models/expensesales'
import IntegrationBookModel from '@models/integationbook'
import PurchaseReturnModel from '@models/purchase-return'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import logger from '@utils/logger'

const getMasterId = (currentUser) => {
  if (currentUser.user_type === userRoles.staff.type) {
    return currentUser.master_id
  }
  return currentUser.id
}

const sumAmounts = (records, field) => {
  let total = 0
  for (let i = 0; i < records.length; i++) {
    const val = parseFloat(records[i][field])
    if (val && val > 0) {
      total = total + val
    }
  }
  return total
}

const getOpeningBalance = async (masterId) => {
  const vendors = await VendorModel.findAll({
    where: {
      master_id: masterId,
      status: 'active',
    },
    attributes: ['opening_balance'],
  })

  let total = 0
  for (let i = 0; i < vendors.length; i++) {
    const val = parseFloat(vendors[i].opening_balance)
    if (val) {
      total = total + val
    }
  }
  return total
}

const buildDateFilter = (startDate, endDate, dateField = 'date') => {
  const filter = {}

  if (startDate && endDate) {
    filter[dateField] = {
      [Op.between]: [dayjs(startDate).toDate(), dayjs(endDate).toDate()],
    }
  } else if (startDate) {
    filter[dateField] = { [Op.gte]: dayjs(startDate).toDate() }
  } else if (endDate) {
    filter[dateField] = { [Op.lte]: dayjs(endDate).toDate() }
  }

  return filter
}

const getPurchasesData = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate, 'invoice_date')

  const purchases = await PurchaseModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
    },
    attributes: ['net_amount', 'payment_type'],
  })

  let paidOut = 0
  let liability = 0

  for (let i = 0; i < purchases.length; i++) {
    const record = purchases[i]
    if (record.payment_type === 'paid') {
      paidOut = paidOut + sumAmounts([record], 'net_amount')
    } else {
      liability = liability + sumAmounts([record], 'net_amount')
    }
  }

  return { in: 0, out: paidOut, liability }
}

const getSalesData = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const sales = await SalesModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
    },
    attributes: ['amount', 'payment_type'],
  })

  let cashIn = 0
  let receivable = 0

  for (let i = 0; i < sales.length; i++) {
    const record = sales[i]
    if (record.payment_type === 'cash') {
      cashIn = cashIn + sumAmounts([record], 'amount')
    } else {
      receivable = receivable + sumAmounts([record], 'amount')
    }
  }

  return { in: cashIn, out: 0, receivable }
}

const getPurchaseReturnsData = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const returns = await PurchaseReturnModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
    },
    attributes: ['total_amount', 'payment_type'],
  })

  let paidIn = 0
  let liabilityReduction = 0

  for (let i = 0; i < returns.length; i++) {
    const record = returns[i]
    if (record.payment_type === 'paid') {
      paidIn = paidIn + sumAmounts([record], 'total_amount')
    } else {
      liabilityReduction =
        liabilityReduction + sumAmounts([record], 'total_amount')
    }
  }

  return { in: paidIn, out: 0, liabilityReduction }
}

const getWorkingCostsData = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await WorkingCostModel.findAll({
    where: {
      master_id: masterId,
      payment_type: 'expense',
      ...dateFilter,
    },
    attributes: ['amount', 'payment_type'],
  })

  let incomeIn = 0
  let expenseOut = 0

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    if (record.payment_type === 'income') {
      incomeIn = incomeIn + sumAmounts([record], 'amount')
    } else {
      expenseOut = expenseOut + sumAmounts([record], 'amount')
    }
  }

  return { in: incomeIn, out: expenseOut }
}

const getGeneralExpensesData = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await GeneralExpenseModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
    },
    attributes: ['amount'],
  })

  const totalOut = sumAmounts(records, 'amount')
  return { in: 0, out: totalOut }
}

const getExpenseSalesData = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await ExpenseSalesModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
    },
    attributes: ['amount'],
  })

  const totalIn = sumAmounts(records, 'amount')
  return { in: totalIn, out: 0 }
}

const getIntegrationBooksData = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await IntegrationBookModel.findAll({
    where: {
      master_id: masterId,
      payment_type: 'paid',
      ...dateFilter,
    },
    attributes: ['amount', 'payment_type'],
  })

  let paidOut = 0
  let liability = 0

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    if (record.payment_type === 'paid') {
      paidOut = paidOut + sumAmounts([record], 'amount')
    } else {
      liability = liability + sumAmounts([record], 'amount')
    }
  }

  return { in: 0, out: paidOut, liability }
}

const getTransactionDate = (record, dateField) => {
  const date = record[dateField]
  if (date) {
    return new Date(date)
  }
  return new Date()
}

const fetchCashSales = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const sales = await SalesModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
      payment_type: 'cash',
    },
    include: [{ model: VendorModel, as: 'buyer', attributes: ['name'] }],
  })

  const transactions = []
  for (let i = 0; i < sales.length; i++) {
    const sale = sales[i]
    const buyerName = sale.buyer ? sale.buyer.name : 'Unknown'
    transactions.push({
      date: getTransactionDate(sale, 'date'),
      purpose: 'Sale - ' + buyerName,
      type: 'in',
      amount: parseFloat(sale.amount) || 0,
    })
  }
  return transactions
}

const fetchPaidPurchases = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate, 'invoice_date')

  const purchases = await PurchaseModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
      payment_type: 'paid',
    },
    include: [{ model: VendorModel, as: 'vendor', attributes: ['name'] }],
  })

  const transactions = []
  for (let i = 0; i < purchases.length; i++) {
    const purchase = purchases[i]
    const vendorName = purchase.vendor ? purchase.vendor.name : 'Unknown'
    transactions.push({
      date: getTransactionDate(purchase, 'invoice_date'),
      purpose: 'Purchase - ' + vendorName,
      type: 'out',
      amount: parseFloat(purchase.net_amount) || 0,
    })
  }
  return transactions
}

const fetchPaidPurchaseReturns = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const returns = await PurchaseReturnModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
      payment_type: 'paid',
    },
    include: [
      { model: VendorModel, as: 'to_vendor_data', attributes: ['name'] },
    ],
  })

  const transactions = []
  for (let i = 0; i < returns.length; i++) {
    const ret = returns[i]
    const vendorName = ret.to_vendor_data ? ret.to_vendor_data.name : 'Unknown'
    transactions.push({
      date: getTransactionDate(ret, 'date'),
      purpose: 'Purchase Return - ' + vendorName,
      type: 'in',
      amount: parseFloat(ret.total_amount) || 0,
    })

    if (ret.return_type === 'vendor') {
      transactions.push({
        date: getTransactionDate(ret, 'date'),
        purpose: 'Purchase Return - ' + vendorName,
        type: 'out',
        amount: parseFloat(ret.total_amount) || 0,
      })
    }
  }
  return transactions
}

const fetchWorkingCostTransactions = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await WorkingCostModel.findAll({
    where: {
      master_id: masterId,
      payment_type: 'expense',
      ...dateFilter,
    },
  })

  const transactions = []
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const type = record.payment_type === 'income' ? 'in' : 'out'
    transactions.push({
      date: getTransactionDate(record, 'date'),
      purpose: 'Working Cost - ' + record.purpose,
      type: type,
      amount: parseFloat(record.amount) || 0,
    })
  }
  return transactions
}

const fetchGeneralExpenses = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await GeneralExpenseModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
    },
  })

  const transactions = []
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    transactions.push({
      date: getTransactionDate(record, 'date'),
      purpose: 'General Expense - ' + record.purpose,
      type: 'out',
      amount: parseFloat(record.amount) || 0,
    })
  }
  return transactions
}

const fetchExpenseSales = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await ExpenseSalesModel.findAll({
    where: {
      master_id: masterId,
      ...dateFilter,
    },
  })

  const transactions = []
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    transactions.push({
      date: getTransactionDate(record, 'date'),
      purpose: 'General Sale - ' + record.purpose,
      type: 'in',
      amount: parseFloat(record.amount) || 0,
    })
  }
  return transactions
}

const fetchPaidIntegrationBooks = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)

  const records = await IntegrationBookModel.findAll({
    where: {
      master_id: masterId,
      payment_type: 'paid',
      ...dateFilter,
    },
  })

  const transactions = []
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    transactions.push({
      date: getTransactionDate(record, 'date'),
      purpose: 'Integration Book',
      type: 'out',
      amount: parseFloat(record.amount) || 0,
    })
  }
  return transactions
}

const combineAndSortTransactions = (transactions) => {
  const combined = []
  for (let i = 0; i < transactions.length; i++) {
    const source = transactions[i]
    for (let j = 0; j < source.length; j++) {
      combined.push(source[j])
    }
  }

  combined.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    if (dateA !== dateB) {
      return dateA - dateB
    }
    return a.type === 'in' ? -1 : 1
  })

  return combined
}

const calculateRunningBalance = (transactions, openingBalance) => {
  let balance = openingBalance
  const result = []

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.type === 'in') {
      balance = balance + t.amount
    } else {
      balance = balance - t.amount
    }
    result.push({
      date: t.date,
      purpose: t.purpose,
      type: t.type,
      amount: t.amount,
      balance: balance,
    })
  }

  return result
}

const filterTransactionsByPurpose = (transactions, purpose) => {
  if (!purpose) {
    return transactions
  }

  const searchTerm = purpose.toLowerCase()
  const filtered = []

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.purpose.toLowerCase().includes(searchTerm)) {
      filtered.push(t)
    }
  }

  return filtered
}

const formatTransactionDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getAllTransactions = async (masterId, startDate, endDate) => {
  const cashSales = await fetchCashSales(masterId, startDate, endDate)
  const paidPurchases = await fetchPaidPurchases(masterId, startDate, endDate)
  const paidReturns = await fetchPaidPurchaseReturns(
    masterId,
    startDate,
    endDate
  )
  const workingCosts = await fetchWorkingCostTransactions(
    masterId,
    startDate,
    endDate
  )
  const generalExpenses = await fetchGeneralExpenses(
    masterId,
    startDate,
    endDate
  )
  const expenseSales = await fetchExpenseSales(masterId, startDate, endDate)
  const integrationBooks = await fetchPaidIntegrationBooks(
    masterId,
    startDate,
    endDate
  )

  const allTransactions = combineAndSortTransactions([
    cashSales,
    paidPurchases,
    paidReturns,
    workingCosts,
    generalExpenses,
    expenseSales,
    integrationBooks,
  ])

  return allTransactions
}

const getBalanceSheet = async (filter, currentUser) => {
  const { from_date, to_date, purpose } = filter

  logger.debug(
    { from_date, to_date, purpose, actor_id: currentUser.id },
    'Fetching balance sheet'
  )

  const masterId = getMasterId(currentUser)

  const openingBalance = await getOpeningBalance(masterId)


  const purchasesData = await getPurchasesData(masterId, from_date, to_date)
  const salesData = await getSalesData(masterId, from_date, to_date)
  const purchaseReturnsData = await getPurchaseReturnsData(
    masterId,
    from_date,
    to_date
  )
  const workingCostsData = await getWorkingCostsData(
    masterId,
    from_date,
    to_date
  )
  const generalExpensesData = await getGeneralExpensesData(
    masterId,
    from_date,
    to_date
  )
  const expenseSalesData = await getExpenseSalesData(
    masterId,
    from_date,
    to_date
  )
  const integrationBooksData = await getIntegrationBooksData(
    masterId,
    from_date,
    to_date
  )

  const totalIn =
    salesData.in +
    purchaseReturnsData.in +
    workingCostsData.in +
    expenseSalesData.in

  const totalOut =
    purchasesData.out +
    workingCostsData.out +
    generalExpensesData.out +
    integrationBooksData.out

  const liability =
    purchasesData.liability +
    integrationBooksData.liability -
    purchaseReturnsData.liabilityReduction

  const receivable = salesData.receivable

  const net = totalIn - totalOut
  const closingBalance = openingBalance + net

  const breakdown = {
    purchases: {
      in: purchasesData.in,
      out: purchasesData.out,
      liability: purchasesData.liability,
    },
    sales: {
      in: salesData.in,
      out: 0,
      receivable: salesData.receivable,
    },
    purchase_returns: {
      in: purchaseReturnsData.in,
      out: 0,
      liability_reduction: purchaseReturnsData.liabilityReduction,
    },
    working_costs: {
      in: workingCostsData.in,
      out: workingCostsData.out,
    },
    general_expenses: {
      in: 0,
      out: generalExpensesData.out,
    },
    expense_sales: {
      in: expenseSalesData.in,
      out: 0,
    },
    integration_books: {
      in: 0,
      out: integrationBooksData.out,
      liability: integrationBooksData.liability,
    },
  }

  const rawTransactions = await getAllTransactions(masterId, from_date, to_date)
  const filteredTransactions = filterTransactionsByPurpose(
    rawTransactions,
    purpose
  )
  const transactions = calculateRunningBalance(filteredTransactions, 0)

  const formattedTransactions = transactions
    .map((t) => ({
      date: formatTransactionDate(t.date),
      purpose: t.purpose,
      type: t.type,
      amount: parseFloat(t.amount.toFixed(2)),
      balance: parseFloat(t.balance.toFixed(2)),
    }))

  logger.info(
    {
      actor_id: currentUser.id,
      opening_balance: openingBalance,
      total_in: totalIn,
      total_out: totalOut,
      liability,
      receivable,
      transaction_count: formattedTransactions.length,
    },
    'Balance sheet fetched'
  )

  return {
    opening_balance: parseFloat(openingBalance.toFixed(2)),
    from_date: from_date || null,
    to_date: to_date || null,
    summary: {
      total_in: parseFloat(totalIn.toFixed(2)),
      total_out: parseFloat(totalOut.toFixed(2)),
      liability: parseFloat(liability.toFixed(2)),
      receivable: parseFloat(receivable.toFixed(2)),
      net: parseFloat(net.toFixed(2)),
      closing_balance: parseFloat(closingBalance.toFixed(2)),
    },
    breakdown,
    transactions: formattedTransactions.reverse() || [],
  }
}

const balanceSheetService = {
  getBalanceSheet,
}

export default balanceSheetService
