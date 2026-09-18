import referralService from './referral.service.js'
import asyncHandler from '@utils/async-handler'

const create = async (req, res) => {
  const partner = await referralService.create(req.body, req.user)
  res.success(partner, { message: 'referral partner created', statusCode: 201 })
}

const getAll = async (req, res) => {
  const result = await referralService.getAll(
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      name: req.query.name,
      status: req.query.status,
    },
    req.user
  )
  res.success(result, { message: 'referral partners list' })
}

const getById = async (req, res) => {
  const partner = await referralService.getById(req.params.partner_id, req.user)
  res.success(partner, { message: 'referral partner details' })
}

const updateById = async (req, res) => {
  const partner = await referralService.updateById(
    req.params.partner_id,
    req.body,
    req.user
  )
  res.success(partner, { message: 'referral partner updated' })
}

const getLedger = async (req, res) => {
  const result = await referralService.getLedger(
    req.params.partner_id,
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    },
    req.user
  )
  res.success(result, { message: 'referral ledger' })
}

const recordPayment = async (req, res) => {
  const txn = await referralService.recordPayment(
    req.params.partner_id,
    req.body,
    req.user
  )
  res.success(txn, { message: 'payment recorded', statusCode: 201 })
}

const linkCompany = async (req, res) => {
  const result = await referralService.linkCompany(
    req.params.partner_id,
    req.body,
    req.user
  )
  res.success(result, { message: 'company linked', statusCode: 201 })
}

const referralController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  getLedger: asyncHandler(getLedger),
  recordPayment: asyncHandler(recordPayment),
  linkCompany: asyncHandler(linkCompany),
}

export default referralController
