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
  ] = await Promise.all([
    fetchVendorsOpeningBalance(masterId),
    fetchSales(masterId, startDate, endDate),
    fetchPurchases(masterId, startDate, endDate),
    fetchPurchaseReturns(masterId, startDate, endDate),
    fetchWorkingCosts(masterId, startDate, endDate),
    fetchGeneralExpenses(masterId, startDate, endDate),
    fetchExpenseSales(masterId, startDate, endDate),
    fetchIntegrationBooks(masterId, startDate, endDate),
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
        purpose: 'Purchase - ' + vendorName,
        type: 'out',
        amount: parseFloat(r.net_amount) || 0,
        category: 'purchase',
      })
    }
  }
  return txns
}

const purchaseReturnToTransactions = (records) => {
  const txns = []
  for (const r of records) {
    const vendorName = r.to_vendor_data
      ? r.to_vendor_data.name
      : 'Unknown'
    if (r.payment_type === 'paid') {
      txns.push({
        date: r.date,
        purpose: 'Purchase Return - ' + vendorName,
        type: 'in',
        amount: parseFloat(r.total_amount) || 0,
        category: 'purchase_return',
      })
      if (r.return_type === 'vendor') {
        txns.push({
          date: r.date,
          purpose: 'Purchase Return - ' + vendorName,
          type: 'out',
          amount: parseFloat(r.total_amount) || 0,
          category: 'purchase_return',
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
      })
    }
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
    return a.type === 'in' ? -1 : 1
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

  const receivable = sumWhere(
    records.sales,
    'amount',
    'payment_type',
    'credit'
  )

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
    if (purchase.vendor.name !== 'Internal') {
      transactions.push({
        date: getTransactionDate(purchase, 'invoice_date'),
        purpose: 'Purchase - ' + vendorName,
        type: 'out',
        amount: parseFloat(purchase.net_amount) || 0,
      })
    }
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

  let inAmount = 0
  let outAmount = 0
  const formattedTransactions = transactions.map((t) => {
    const parsedAmount = parseFloat(t.amount.toFixed(2))
    if (t.type === 'in') {
      inAmount += parsedAmount
    } else {
      outAmount += parsedAmount
    }
    return {
      date: formatTransactionDate(t.date),
      purpose: t.purpose,
      type: t.type,
      amount: parseFloat(t.amount.toFixed(2)),
      balance: parseFloat(t.balance.toFixed(2)),
    }
  })

  let inA = 0,
    outA = 0
  for (let t of transactions) {
    if (t.type === 'in') {
      inA += t.amount
    } else {
      outA += t.amount
    }
  }
  return {
    opening_balance: parseFloat(openingBalance.toFixed(2)),
    from_date: from_date || null,
    to_date: to_date || null,
    summary: {
      total_in: parseFloat(inA.toFixed(2)),
      total_out: parseFloat(outA.toFixed(2)),
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
