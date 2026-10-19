import InvestorManagementService from './management.service'
import asyncHandler from '@utils/async-handler'
import { parseInvestorFilter } from '@utils/list-filters'

async function createInvestor(req, res) {
  const newInvestor = await InvestorManagementService.createInvestor(
    req.body,
    req.user
  )
  res.success(newInvestor, {
    message: 'Investor created successfully',
    statusCode: 201,
  })
}

async function getAllInvestors(req, res) {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    ...parseInvestorFilter(req.query),
  }

  const investorRecords = await InvestorManagementService.getAllInvestors(
    filter,
    req.user
  )
  res.success(investorRecords, { message: 'Investors fetched successfully' })
}

async function getInvestorById(req, res) {
  const { investor_id } = req.params
  const investorRecord = await InvestorManagementService.getInvestorById(
    investor_id,
    req.user
  )
  res.success(investorRecord, {
    message: 'Investor details fetched successfully',
  })
}

async function updateInvestor(req, res) {
  const { investor_id } = req.params
  const payload = req.body

  await InvestorManagementService.updateInvestor(investor_id, payload, req.user)
  res.success(null, { message: 'Investor updated successfully' })
}

async function toggleInvestorStatus(req, res) {
  const { investor_id } = req.params
  await InvestorManagementService.toggleInvestorStatus(investor_id, req.user)
  res.success(null, { message: 'Investor status toggled successfully' })
}

const InvestorManagementController = {
  createInvestor: asyncHandler(createInvestor),
  getAllInvestors: asyncHandler(getAllInvestors),
  getInvestorById: asyncHandler(getInvestorById),
  updateInvestor: asyncHandler(updateInvestor),
  toggleInvestorStatus: asyncHandler(toggleInvestorStatus),
}

export default InvestorManagementController
