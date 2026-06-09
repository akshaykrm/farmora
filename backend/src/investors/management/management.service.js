import { Op } from 'sequelize'
import InvestorManagementModel from '@models/investorManagement'
import userRoles from '@utils/user-roles'
import {
  InvestorNotFoundError,
  InvestorPhoneConflictError,
} from '@errors/investorManagement.errors'

async function createInvestor(payload, currentUser) {
  payload.master_id = currentUser.id

  const existing = await InvestorManagementModel.findOne({
    where: { investor_phone: payload.investor_phone },
  })
  if (existing) {
    throw new InvestorPhoneConflictError(payload.investor_phone)
  }

  const newInvestor = await InvestorManagementModel.create(payload)
  return newInvestor
}

async function getAllInvestors(payload, currentUser) {
  const { page, limit, search, start_date, end_date, ...filter } = payload
  const offset = (page - 1) * limit

  if (search) {
    filter[Op.or] = [
      { investor_name: { [Op.iLike]: `%${search}%` } },
      { investor_phone: { [Op.iLike]: `%${search}%` } },
      { investor_email: { [Op.iLike]: `%${search}%` } },
    ]
  }

  if (start_date || end_date) {
    filter.created_at = {}
    if (start_date) {
      filter.created_at[Op.gte] = new Date(start_date)
    }
    if (end_date) {
      filter.created_at[Op.lte] = new Date(end_date)
    }
  }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const { count, rows } = await InvestorManagementModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  return {
    page,
    limit,
    total: count,
    data: rows,
  }
}

async function getInvestorById(investorId, currentUser) {
  const filter = { id: investorId }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const investorRecord = await InvestorManagementModel.findOne({
    where: filter,
  })
  if (!investorRecord) {
    throw new InvestorNotFoundError(investorId)
  }
  return investorRecord
}

async function updateInvestor(investorId, payload, currentUser) {
  const investorRecord = await getInvestorById(investorId, currentUser)

  if (
    payload.investor_phone &&
    payload.investor_phone !== investorRecord.investor_phone
  ) {
    const existing = await InvestorManagementModel.findOne({
      where: { investor_phone: payload.investor_phone },
    })
    if (existing) {
      throw new InvestorPhoneConflictError(payload.investor_phone)
    }
  }

  await investorRecord.update(payload)
}

async function toggleInvestorStatus(investorId, currentUser) {
  const investorRecord = await getInvestorById(investorId, currentUser)
  await investorRecord.update({ is_active: !investorRecord.is_active })
}

const InvestorManagementService = {
  createInvestor,
  getAllInvestors,
  getInvestorById,
  updateInvestor,
  toggleInvestorStatus,
}

export default InvestorManagementService
