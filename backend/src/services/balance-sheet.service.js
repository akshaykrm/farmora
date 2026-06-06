import PurchaseModel from '@models/purchase'
import SalesModel from '@models/sales'
import VendorModel from '@models/vendor'
import WorkingCostModel from '@models/workingcost'
import GeneralExpenseModel from '@models/generalexpense'
import ExpenseSalesModel from '@models/expensesales'
import IntegrationBookModel from '@models/integationbook'
import PurchaseReturnModel from '@models/purchase-return'
import PurchaseBookModel from '@models/purchasebook'
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const round = (num) => parseFloat(num.toFixed(2))

const sumField = (records, field) => {
  let total = 0
  for (const r of records) {
    total += parseFloat(r[field]) || 0
  }
  return total
}

const sumWhere = (records, field, conditionField, conditionValue) => {
  let total = 0
  for (const r of records) {
    if (r[conditionField] === conditionValue) {
      total += parseFloat(r[field]) || 0
    }
  }
  return total
}

// ---------------------------------------------------------------------------
// PHASE 1 — FETCH: get all raw records from every model in parallel
// ---------------------------------------------------------------------------

const fetchVendorsOpeningBalance = async (masterId) => {
  const result = await VendorModel.sum('opening_balance', {
    where: { master_id: masterId, status: 'active' },
  })
  return parseFloat(result) || 0
}

const fetchSales = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)
  return SalesModel.findAll({
    where: { master_id: masterId, ...dateFilter },
    include: [{ model: VendorModel, as: 'buyer', attributes: ['name'] }],
  })
}

const fetchPurchases = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate, 'invoice_date')
  return PurchaseModel.findAll({
    where: { master_id: masterId, ...dateFilter },
    include: [{ model: VendorModel, as: 'vendor', attributes: ['name'] }],
  })
}

const fetchPurchaseReturns = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)
  return PurchaseReturnModel.findAll({
    where: { master_id: masterId, ...dateFilter },
    include: [
      { model: VendorModel, as: 'to_vendor_data', attributes: ['name'] },
    ],
  })
}

const fetchWorkingCosts = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)
  return WorkingCostModel.findAll({
    where: { master_id: masterId, ...dateFilter },
  })
}

const fetchGeneralExpenses = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)
  return GeneralExpenseModel.findAll({
    where: { master_id: masterId, ...dateFilter },
  })
}

const fetchExpenseSales = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)
  return ExpenseSalesModel.findAll({
    where: { master_id: masterId, ...dateFilter },
  })
}

const fetchIntegrationBooks = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)
  return IntegrationBookModel.findAll({
    where: { master_id: masterId, ...dateFilter },
  })
}

const fetchPurchaseBooks = async (masterId, startDate, endDate) => {
  const dateFilter = buildDateFilter(startDate, endDate)
  return PurchaseBookModel.findAll({
    where: { master_id: masterId, ...dateFilter },
    include: [{ model: VendorModel, as: 'vendor', attributes: ['name'] }],
  })
}

const fetchAllRecords = async (masterId, startDate, endDate) => {
  const [
    openingBalance,
    sales,
    purchases,
    purchaseReturns,
    workingCosts,
    generalExpenses,
    expenseSales,
    integrationBooks,
    purchaseBooks,
  ] = await Promise.all([
    fetchVendorsOpeningBalance(masterId),
    fetchSales(masterId, startDate, endDate),
    fetchPurchases(masterId, startDate, endDate),
    fetchPurchaseReturns(masterId, startDate, endDate),
    fetchWorkingCosts(masterId, startDate, endDate),
    fetchGeneralExpenses(masterId, startDate, endDate),
    fetchExpenseSales(masterId, startDate, endDate),
    fetchIntegrationBooks(masterId, startDate, endDate),
    fetchPurchaseBooks(masterId, startDate, endDate),
  ])

  return {
    openingBalance,
    sales,
    purchases,
    purchaseReturns,
    workingCosts,
    generalExpenses,
    expenseSales,
    integrationBooks,
    purchaseBooks,
  }
}

// ---------------------------------------------------------------------------
// PHASE 2 — TRANSFORM: convert raw DB records into unified {date, purpose,
//            type, amount, category} transaction objects
// ---------------------------------------------------------------------------

const saleToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    const buyerName = r.buyer ? r.buyer.name : 'Unknown'
    if (r.payment_type === 'cash' || r.payment_type === 'paid') {
      txns.push({
        date: r.date,
        purpose: 'Sale - ' + buyerName,
        type: 'in',
        amount: parseFloat(r.amount) || 0,
        category: 'sale',
        createdAt: r.createdAt,
      })
    }
  }
  return txns
}

const purchaseToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    const vendorName = r.vendor ? r.vendor.name : 'Unknown'
    if (r.payment_type === 'paid' && vendorName !== 'Internal') {
      txns.push({
        date: r.invoice_date,
        purpose: 'Payment to ' + vendorName,
        type: 'out',
        amount: parseFloat(r.net_amount) || 0,
        category: 'purchase',
        createdAt: r.createdAt,
      })
    }
  }
  return txns
}

const purchaseReturnToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    const vendorName = r.to_vendor_data ? r.to_vendor_data.name : 'Unknown'
    if (r.payment_type === 'paid') {
      txns.push({
        date: r.date,
        purpose: 'Purchase Return - ' + vendorName,
        type: 'in',
        amount: parseFloat(r.total_amount) || 0,
        category: 'purchase_return',
        createdAt: r.createdAt,
      })
      if (r.return_type === 'vendor') {
        txns.push({
          date: r.date,
          purpose: 'Purchase Return - ' + vendorName,
          type: 'out',
          amount: parseFloat(r.total_amount) || 0,
          category: 'purchase_return',
          createdAt: r.createdAt,
        })
      }
    }
  }
  return txns
}

const workingCostToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    if (r.payment_type === 'expense' || r.payment_type === 'income') {
      txns.push({
        date: r.date,
        purpose: 'Working Cost - ' + r.purpose,
        type: r.payment_type === 'income' ? 'in' : 'out',
        amount: parseFloat(r.amount) || 0,
        category: 'working_cost',
        createdAt: r.createdAt,
      })
    }
  }
  return txns
}

const generalExpenseToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    txns.push({
      date: r.date,
      purpose: 'General Expense - ' + r.purpose,
      type: 'out',
      amount: parseFloat(r.amount) || 0,
      category: 'general_expense',
      createdAt: r.createdAt,
    })
  }
  return txns
}

const expenseSaleToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    txns.push({
      date: r.date,
      purpose: 'General Sale - ' + r.purpose,
      type: 'in',
      amount: parseFloat(r.amount) || 0,
      category: 'expense_sale',
      createdAt: r.createdAt,
    })
  }
  return txns
}

const integrationBookToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    if (r.payment_type === 'paid') {
      txns.push({
        date: r.date,
        purpose: 'Integration Book',
        type: 'out',
        amount: parseFloat(r.amount) || 0,
        category: 'integration_book',
        createdAt: r.createdAt,
      })
    }
  }
  return txns
}

const purchaseBookToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    txns.push({
      date: r.date,
      purpose: `Payment to ${r.vendor?.name || 'Unknown'}`,
      type: 'out',
      amount: parseFloat(r.amount) || 0,
      category: 'purchase_book',
      createdAt: r.createdAt,
    })
  }
  return txns
}

// ---------------------------------------------------------------------------
// PHASE 3 — MERGE & SORT: combine all category transaction arrays into one
//            date-sorted list
// ---------------------------------------------------------------------------

const mergeAndSort = (...arrays) => {
  const combined = []
  for (const arr of arrays) {
    for (const t of arr) {
      combined.push(t)
    }
  }
  combined.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    if (dateA !== dateB) {
      return dateA - dateB
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
  return combined
}

// ---------------------------------------------------------------------------
// PHASE 4 — RUNNING BALANCE: compute cumulative balance from sorted
//            transactions, starting at openingBalance
// ---------------------------------------------------------------------------

const calculateRunningBalance = (transactions, openingBalance) => {
  let balance = openingBalance
  const result = []
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.type === 'in') {
      balance += t.amount
    } else {
      balance -= t.amount
    }
    result.push({
      date: t.date,
      purpose: t.purpose,
      type: t.type,
      amount: t.amount,
      balance,
    })
  }
  return result
}

// ---------------------------------------------------------------------------
// PHASE 5 — SUMMARY: derive aggregate metrics from raw records + transactions
// ---------------------------------------------------------------------------

const deriveSummary = (transactions, records, openingBalance) => {
  let totalIn = 0
  let totalOut = 0
  for (const t of transactions) {
    if (t.type === 'in') {
      totalIn += t.amount
    } else {
      totalOut += t.amount
    }
  }

  const liability =
    sumWhere(records.purchases, 'net_amount', 'payment_type', 'credit') +
    sumWhere(records.integrationBooks, 'amount', 'payment_type', 'credit') -
    sumWhere(records.purchaseReturns, 'total_amount', 'payment_type', 'credit')

  const receivable = sumWhere(records.sales, 'amount', 'payment_type', 'credit')

  const net = totalIn - totalOut
  const closingBalance = openingBalance + net

  return {
    total_in: round(totalIn),
    total_out: round(totalOut),
    liability: round(liability),
    receivable: round(receivable),
    net: round(net),
    closing_balance: round(closingBalance),
  }
}

const buildBreakdown = (records) => {
  const paidPurchases = sumWhere(
    records.purchases,
    'net_amount',
    'payment_type',
    'paid'
  )
  const creditPurchases = sumWhere(
    records.purchases,
    'net_amount',
    'payment_type',
    'credit'
  )

  const cashAndPaidSales =
    sumWhere(records.sales, 'amount', 'payment_type', 'cash') +
    sumWhere(records.sales, 'amount', 'payment_type', 'paid')
  const creditSales = sumWhere(
    records.sales,
    'amount',
    'payment_type',
    'credit'
  )

  const paidReturns = sumWhere(
    records.purchaseReturns,
    'total_amount',
    'payment_type',
    'paid'
  )
  const vendorPaidReturns = sumWhere(
    records.purchaseReturns.filter((r) => r.return_type === 'vendor'),
    'total_amount',
    'payment_type',
    'paid'
  )
  const creditReturns = sumWhere(
    records.purchaseReturns,
    'total_amount',
    'payment_type',
    'credit'
  )

  const workingIncome = sumWhere(
    records.workingCosts,
    'amount',
    'payment_type',
    'income'
  )
  const workingExpense = sumWhere(
    records.workingCosts,
    'amount',
    'payment_type',
    'expense'
  )

  const genExpenseTotal = sumField(records.generalExpenses, 'amount')
  const expSalesTotal = sumField(records.expenseSales, 'amount')

  const paidIntegration = sumWhere(
    records.integrationBooks,
    'amount',
    'payment_type',
    'paid'
  )
  const creditIntegration = sumWhere(
    records.integrationBooks,
    'amount',
    'payment_type',
    'credit'
  )

  return {
    purchases: {
      in: 0,
      out: round(paidPurchases),
      liability: round(creditPurchases),
    },
    sales: {
      in: round(cashAndPaidSales),
      out: 0,
      receivable: round(creditSales),
    },
    purchase_returns: {
      in: round(paidReturns),
      out: round(vendorPaidReturns),
      liability_reduction: round(creditReturns),
    },
    working_costs: {
      in: round(workingIncome),
      out: round(workingExpense),
    },
    general_expenses: {
      in: 0,
      out: round(genExpenseTotal),
    },
    expense_sales: {
      in: round(expSalesTotal),
      out: 0,
    },
    integration_books: {
      in: 0,
      out: round(paidIntegration),
      liability: round(creditIntegration),
    },
    purchase_books: {
      in: 0,
      out: round(sumField(records.purchaseBooks, 'amount')),
    },
  }
}

// ---------------------------------------------------------------------------
// PHASE 6 — FORMAT: filter by purpose, format dates, apply rounding
// ---------------------------------------------------------------------------

const filterByPurpose = (transactions, purpose) => {
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

const formatTransactions = (transactions) => {
  return transactions.map((t) => ({
    date: dayjs(t.date).format('YYYY-MM-DD'),
    purpose: t.purpose,
    type: t.type,
    amount: round(t.amount),
    balance: round(t.balance),
  }))
}

const getBalanceSheet = async (filter, currentUser) => {
  const { from_date, to_date, purpose } = filter

  logger.debug(
    { from_date, to_date, purpose, actor_id: currentUser.id },
    'Fetching balance sheet'
  )

  const masterId = getMasterId(currentUser)

  // -----------------------------------------------------------------------
  // PHASE 1 — Fetch all raw records in parallel
  // -----------------------------------------------------------------------
  const records = await fetchAllRecords(masterId, from_date, to_date)
  const { openingBalance } = records

  // -----------------------------------------------------------------------
  // PHASE 2 — Transform each category into unified transactions
  // -----------------------------------------------------------------------
  const saleTxns = saleToTransactions(records.sales)
  const purchaseTxns = purchaseToTransactions(records.purchases)
  const returnTxns = purchaseReturnToTransactions(records.purchaseReturns)
  const workingTxns = workingCostToTransactions(records.workingCosts)
  const expenseTxns = generalExpenseToTransactions(records.generalExpenses)
  const expenseSaleTxns = expenseSaleToTransactions(records.expenseSales)
  const integTxns = integrationBookToTransactions(records.integrationBooks)
  const purchaseBookTxns = purchaseBookToTransactions(records.purchaseBooks)

  // -----------------------------------------------------------------------
  // PHASE 3 — Merge & sort by date
  // -----------------------------------------------------------------------
  const sorted = mergeAndSort(
    saleTxns,
    purchaseTxns,
    returnTxns,
    workingTxns,
    expenseTxns,
    expenseSaleTxns,
    integTxns,
    purchaseBookTxns
  )

  // -----------------------------------------------------------------------
  // PHASE 4 — Filter by purpose (before running balance so balance reflects
  //            the filtered subset)
  // -----------------------------------------------------------------------
  const filtered = filterByPurpose(sorted, purpose)

  // -----------------------------------------------------------------------
  // PHASE 5 — Running balance starting at openingBalance
  // -----------------------------------------------------------------------
  const withBalance = calculateRunningBalance(filtered, openingBalance)

  // -----------------------------------------------------------------------
  // PHASE 6 — Derive summary + breakdown from raw data
  // -----------------------------------------------------------------------
  const summary = deriveSummary(withBalance, records, openingBalance)
  const breakdown = buildBreakdown(records)

  // -----------------------------------------------------------------------
  // FORMAT — Round, format dates, reverse for newest-first output
  // -----------------------------------------------------------------------
  const transactions = formatTransactions(withBalance).reverse()

  return {
    opening_balance: round(openingBalance),
    from_date: from_date || null,
    to_date: to_date || null,
    summary,
    breakdown,
    transactions,
  }
}

const balanceSheetService = {
  getBalanceSheet,
}

export default balanceSheetService
