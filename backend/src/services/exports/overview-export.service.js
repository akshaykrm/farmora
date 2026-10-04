import overviewService from '@services/overview.service'
import InvestorManagementService from '../../investors/management/management.service'
import LedgerService from '../../investors/ledger/ledger.service'
import { TRANSACTION_CATEGORIES } from '../../investors/ledger/ledger.constants'
import InvestorTransactionTypeModel from '@models/investorTransactionType'
import { compactMeta } from '@utils/export/report'
import { dateMeta, nameOf, statusLabel, sumOf, toPlain } from './helpers.js'

// The overview service paginates in memory with slice(). Infinity would make the
// offset 0 * Infinity = NaN, so the largest safe integer stands in for "no limit".
const ALL = { page: 1, limit: Number.MAX_SAFE_INTEGER }

const batchOverview = async (filter, currentUser) => {
  const data = await overviewService.getBatchOverview(
    {
      ...filter,
      e_page: ALL.page,
      e_limit: ALL.limit,
      s_page: ALL.page,
      s_limit: ALL.limit,
      r_page: ALL.page,
      r_limit: ALL.limit,
    },
    currentUser
  )
  const summary = data.overviewCalculations || {}

  const expenses = (data.expenses?.data || []).map((record) => {
    const row = toPlain(record)
    return {
      date: row.date,
      purpose: row.category?.type,
      narration: row.narration,
      quantity: row.quantity,
      price: row.price_per_unit,
      amount: row.net_amount,
    }
  })

  const sales = (data.sales?.data || []).map((record) => {
    const row = toPlain(record)
    return {
      date: row.date,
      vehicle_no: row.vehicle_no,
      bird_no: row.bird_no,
      weight: row.weight,
      avg_weight: row.avg_weight,
      price: row.price,
      amount: row.amount,
      payment_type: row.payment_type?.toUpperCase(),
    }
  })

  const returns = (data.returns?.data || []).map((record) => {
    const row = toPlain(record)
    const returnTo =
      row.return_type === 'vendor' ? row.vendor?.name : row.to_batch_data?.name
    return {
      date: row.date,
      purpose: [row.category?.type, returnTo && `return to ${returnTo}`]
        .filter(Boolean)
        .join(' '),
      quantity: row.quantity,
      price: row.rate_per_bag,
      amount: row.total_amount,
    }
  })

  const batch = data.batch

  return {
    title: 'Batch Overview',
    filename: 'batch-overview',
    meta: compactMeta([
      { label: 'Batch', value: batch?.name || `#${filter.batch_id}` },
      { label: 'Season', value: batch?.season?.name },
      { label: 'Status', value: statusLabel(batch?.status) },
      { label: 'Closed On', value: batch?.closed_on, type: 'date' },
    ]),
    sections: [
      {
        title: 'Expenses',
        columns: [
          { key: 'date', header: 'Date', type: 'date' },
          { key: 'purpose', header: 'Purpose' },
          { key: 'narration', header: 'Narration', width: 2 },
          { key: 'quantity', header: 'Quantity', type: 'number' },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'amount', header: 'Amount', type: 'currency' },
        ],
        rows: expenses,
      },
      {
        title: 'Sales',
        columns: [
          { key: 'date', header: 'Date', type: 'date' },
          { key: 'vehicle_no', header: 'Vehicle No' },
          { key: 'bird_no', header: 'Birds', type: 'number' },
          { key: 'weight', header: 'Weight (kg)', type: 'number' },
          { key: 'avg_weight', header: 'Avg Weight', type: 'number' },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'amount', header: 'Amount', type: 'currency' },
          { key: 'payment_type', header: 'Payment' },
        ],
        rows: sales,
      },
      {
        title: 'Returned Items',
        columns: [
          { key: 'date', header: 'Date', type: 'date' },
          { key: 'purpose', header: 'Purpose', width: 2 },
          { key: 'quantity', header: 'Quantity', type: 'number' },
          { key: 'price', header: 'Price', type: 'currency' },
          { key: 'amount', header: 'Amount', type: 'currency' },
        ],
        rows: returns,
      },
    ],
    summary: [
      {
        label: 'Total Purchased Feed (bags)',
        value: summary.total_purchase_feeds,
        type: 'number',
      },
      {
        label: 'Total Purchase Amount',
        value: summary.total_purchase_amount,
        type: 'currency',
      },
      {
        label: 'Total Returned Feed (bags)',
        value: summary.total_returned_feeds,
        type: 'number',
      },
      {
        label: 'Total Returned Amount',
        value: summary.total_returned_amount,
        type: 'currency',
      },
      {
        label: 'Total Expense',
        value: summary.total_expense,
        type: 'currency',
      },
      {
        label: 'Total Sale Birds',
        value: summary.total_sale_birds,
        type: 'number',
      },
      {
        label: 'Total Sale Weight (kg)',
        value: summary.total_sale_weight,
        type: 'number',
      },
      {
        label: 'Total Sale Amount',
        value: summary.total_sale_amount,
        type: 'currency',
      },
      { label: 'Avg Weight', value: summary.avg_weight, type: 'number' },
      { label: 'FCR', value: summary.fcr, type: 'number' },
      { label: 'CFCR', value: summary.cfcr, type: 'number' },
      {
        label: 'Profit / Loss',
        value: (summary.total_sale_amount || 0) - (summary.total_expense || 0),
        type: 'currency',
      },
    ],
  }
}

const seasonOverview = async (filter, currentUser) => {
  const data = await overviewService.getSeasonOverview(
    {
      ...filter,
      b_page: ALL.page,
      b_limit: ALL.limit,
      gc_page: ALL.page,
      gc_limit: ALL.limit,
      gs_page: ALL.page,
      gs_limit: ALL.limit,
    },
    currentUser
  )

  const batches = (data.batches?.data || []).map((item) => {
    const calc = item.overviewCalculations || {}
    const avgCost = calc.total_expense / calc.total_sale_weight
    const avgRate = calc.total_sale_amount / calc.total_sale_weight
    return {
      name: item.batch?.name,
      closed_on: item.batch?.closed_on,
      avg_weight: calc.avg_weight,
      fcr: calc.fcr,
      cfcr: calc.cfcr,
      avg_cost: avgCost,
      avg_rate: avgRate,
      diff: avgRate - avgCost,
      profit: (calc.total_sale_amount || 0) - (calc.total_expense || 0),
    }
  })

  const entryColumns = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'purpose', header: 'Purpose', width: 3 },
    { key: 'amount', header: 'Amount', type: 'currency' },
  ]

  const { totals = {}, summary = {} } = data

  return {
    title: 'Season Overview',
    filename: 'season-overview',
    meta: compactMeta([
      { label: 'Season', value: data.season?.name },
      { label: 'Closed On', value: data.season?.closed_on, type: 'date' },
      { label: 'General Cost Purpose', value: filter.gc_purpose },
      { label: 'General Sales Purpose', value: filter.gs_purpose },
    ]),
    sections: [
      {
        title: 'Batch Overview',
        columns: [
          { key: 'name', header: 'Batch', width: 1.3 },
          { key: 'closed_on', header: 'Close Date', type: 'date' },
          { key: 'avg_weight', header: 'Avg Weight', type: 'number' },
          { key: 'fcr', header: 'FCR', type: 'number', width: 0.8 },
          { key: 'cfcr', header: 'CFCR', type: 'number', width: 0.8 },
          { key: 'avg_cost', header: 'Avg Cost', type: 'currency' },
          { key: 'avg_rate', header: 'Avg Rate', type: 'currency' },
          { key: 'diff', header: 'Profit - Loss Diff', type: 'currency' },
          { key: 'profit', header: 'Profit/Loss', type: 'currency' },
        ],
        rows: batches,
      },
      {
        title: 'General Cost',
        columns: entryColumns,
        rows: data.general_costs?.data || [],
      },
      {
        title: 'General Sales',
        columns: entryColumns,
        rows: data.general_sales?.data || [],
      },
    ],
    summary: [
      { label: 'Avg Weight', value: totals.total_avg_weight, type: 'number' },
      { label: 'FCR', value: totals.fcr, type: 'number' },
      { label: 'CFCR', value: totals.cfcr, type: 'number' },
      { label: 'Avg Cost', value: totals.avg_cost, type: 'currency' },
      { label: 'Avg Rate', value: totals.avg_rate, type: 'currency' },
      {
        label: 'Total Batch Profit',
        value: summary.total_batch_profit,
        type: 'currency',
      },
      {
        label: 'Total General Cost',
        value: summary.total_general_cost,
        type: 'currency',
      },
      {
        label: 'Total General Sales',
        value: summary.total_general_sales,
        type: 'currency',
      },
      {
        label: 'Net Season Profit',
        value: summary.net_season_profit,
        type: 'currency',
      },
      {
        label: 'Investor Profit',
        value: summary.investor_profit,
        type: 'currency',
      },
    ],
  }
}

const investors = async (filter, currentUser) => {
  const { data } = await InvestorManagementService.getAllInvestors(
    filter,
    currentUser
  )

  const rows = data.map((record) => {
    const investor = toPlain(record)
    return {
      name: investor.investor_name,
      phone: investor.investor_phone,
      email: investor.investor_email,
      status: statusLabel(investor.is_active),
      created_at: investor.createdAt || investor.created_at,
    }
  })

  return {
    title: 'Investors',
    filename: 'investors',
    meta: compactMeta([
      { label: 'Search', value: filter.search },
      {
        label: 'Status',
        value:
          filter.is_active === undefined ? null : statusLabel(filter.is_active),
      },
      dateMeta(filter.start_date, filter.end_date, 'Created'),
    ]),
    sections: [
      {
        title: 'Investors',
        columns: [
          { key: 'name', header: 'Name', width: 1.5 },
          { key: 'phone', header: 'Phone' },
          { key: 'email', header: 'Email', width: 1.8 },
          { key: 'status', header: 'Status', width: 0.8 },
          { key: 'created_at', header: 'Created Date', type: 'date' },
        ],
        rows,
      },
    ],
    summary: [{ label: 'Records', value: rows.length, type: 'number' }],
  }
}

const LEDGER_TITLES = {
  [TRANSACTION_CATEGORIES.CAPITAL]: {
    title: 'Investments',
    filename: 'investments',
  },
  [TRANSACTION_CATEGORIES.PROFIT]: { title: 'Profits', filename: 'profits' },
}

const investorLedger = async (filter, currentUser) => {
  const { data } = await LedgerService.listInvestorTransactions(
    { ...filter, page: 1, limit: null },
    currentUser
  )

  const rows = data.map((record) => {
    const txn = toPlain(record)
    return {
      txn_id: txn.txn_id,
      investor: txn.investor?.investor_name,
      type: txn.transaction_type?.name,
      season: txn.season?.name,
      amount: txn.amount,
      remarks: txn.remarks,
      transaction_date: txn.transaction_date,
      created_at: txn.createdAt || txn.created_at,
    }
  })

  const [investor, type, balance] = await Promise.all([
    nameOf(
      InvestorManagementService.getInvestorById,
      filter.investor_id,
      currentUser
    ),
    nameOf(
      async (id) => (await InvestorTransactionTypeModel.findByPk(id))?.toJSON(),
      filter.transaction_type_id
    ),
    filter.category
      ? LedgerService.getBalanceSummary(filter, currentUser)
      : null,
  ])

  const { title, filename } = LEDGER_TITLES[filter.category] || {
    title: 'Investor Ledger',
    filename: 'investor-ledger',
  }

  return {
    title,
    filename,
    meta: compactMeta([
      { label: 'Investor', value: investor },
      { label: 'Transaction Type', value: type },
      dateMeta(filter.start_date, filter.end_date),
    ]),
    sections: [
      {
        title,
        columns: [
          { key: 'txn_id', header: 'Txn ID' },
          { key: 'investor', header: 'Investor', width: 1.3 },
          { key: 'type', header: 'Type' },
          { key: 'season', header: 'Season' },
          { key: 'amount', header: 'Amount', type: 'currency' },
          { key: 'remarks', header: 'Remarks', width: 1.8 },
          { key: 'transaction_date', header: 'Transaction Date', type: 'date' },
          { key: 'created_at', header: 'Created Date', type: 'date' },
        ],
        rows,
      },
    ],
    summary: compactMeta([
      { label: 'Records', value: rows.length, type: 'number' },
      { label: 'Total Amount', value: sumOf(rows, 'amount'), type: 'currency' },
      balance === null
        ? null
        : { label: 'Balance', value: balance, type: 'currency' },
    ]),
  }
}

const overviewExportService = {
  batchOverview,
  seasonOverview,
  investors,
  investorLedger,
}

export default overviewExportService
