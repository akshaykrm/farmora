import LedgerService from './ledger.service'
import asyncHandler from '@utils/async-handler'

async function createTransaction(req, res) {
  const transaction = await LedgerService.createInvestorTransaction(
    req.body,
    req.user
  )
  res.success(transaction, {
    message: 'Transaction created successfully',
    statusCode: 201,
  })
}

async function getTransactionById(req, res) {
  const { transaction_id } = req.params
  const transaction = await LedgerService.getInvestorTransactionById(
    transaction_id,
    req.user
  )
  res.success(transaction, {
    message: 'Transaction fetched successfully',
  })
}

async function listTransactions(req, res) {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  }

  if (req.query.investor_id) {
    filter.investor_id = req.query.investor_id
  }
  if (req.query.transaction_type_id) {
    filter.transaction_type_id = req.query.transaction_type_id
  }
  if (req.query.category) {
    filter.category = req.query.category
  }
  if (req.query.start_date) {
    filter.start_date = req.query.start_date
  }
  if (req.query.end_date) {
    filter.end_date = req.query.end_date
  }

  const transactions = await LedgerService.listInvestorTransactions(
    filter,
    req.user
  )
  res.success(transactions, {
    message: 'Transactions fetched successfully',
  })
}

async function getCapitalBalance(req, res) {
  const { investor_id } = req.query
  const balance = await LedgerService.getInvestorCapitalBalance(investor_id)
  res.success({ balance }, { message: 'Capital balance fetched successfully' })
}

async function getProfitBalance(req, res) {
  const { investor_id } = req.query
  const balance = await LedgerService.getInvestorProfitBalance(investor_id)
  res.success({ balance }, { message: 'Profit balance fetched successfully' })
}

async function getBalanceSummary(req, res) {
  const filter = {}
  if (req.query.category) filter.category = req.query.category
  if (req.query.investor_id) filter.investor_id = req.query.investor_id
  if (req.query.start_date) filter.start_date = req.query.start_date
  if (req.query.end_date) filter.end_date = req.query.end_date
  const balance = await LedgerService.getBalanceSummary(filter, req.user)
  res.success({ balance }, { message: 'Balance summary fetched successfully' })
}

async function lookupInvestors(req, res) {
  const investors = await LedgerService.lookupInvestors(req.user)
  res.success(investors, { message: 'Investors fetched successfully' })
}

async function lookupTransactionTypes(req, res) {
  const types = await LedgerService.lookupTransactionTypes()
  res.success(types, { message: 'Transaction types fetched successfully' })
}

const LedgerController = {
  createTransaction: asyncHandler(createTransaction),
  getTransactionById: asyncHandler(getTransactionById),
  listTransactions: asyncHandler(listTransactions),
  getCapitalBalance: asyncHandler(getCapitalBalance),
  getProfitBalance: asyncHandler(getProfitBalance),
  getBalanceSummary: asyncHandler(getBalanceSummary),
  lookupInvestors: asyncHandler(lookupInvestors),
  lookupTransactionTypes: asyncHandler(lookupTransactionTypes),
}

export default LedgerController
