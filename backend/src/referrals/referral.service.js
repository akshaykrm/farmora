import ReferralPartnerModel from '@models/referralpartner'
import ReferralLedgerTransactionModel, {
  REFERRAL_BONUS_TYPES,
  REFERRAL_LEDGER_TYPES,
} from '@models/referralledgertransaction'
import UserModel from '@models/user'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import referralBonusService from '@services/referral-bonus.service'
import subscriptionService from '@services/subscription.service'
import { PermissionDeniedError } from '@errors/auth.errors'
import { UserNotFoundError } from '@errors/user.errors'
import userRoles from '@utils/user-roles'
import { calculateOffSet } from '@utils/pagination'
import { Op, UniqueConstraintError } from 'sequelize'
import { sequelize } from '@utils/db'
import logger from '@utils/logger'
import { getEffectivePackagePrice } from '@utils/package-price'

class ReferralPartnerNotFoundError extends Error {
  constructor(id) {
    super(`referral partner ${id} not found`)
    this.name = 'ReferralPartnerNotFoundError'
    this.code = 'REFERRAL_PARTNER_NOT_FOUND'
    this.statusCode = 404
  }
}

class ReferralPartnerConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ReferralPartnerConflictError'
    this.code = 'REFERRAL_PARTNER_CONFLICT'
    this.statusCode = 400
  }
}

const normalizeCode = (code) => String(code || '').trim().toUpperCase()

const assertAdmin = (currentUser) => {
  if (currentUser.user_type !== userRoles.admin.type) {
    throw new PermissionDeniedError()
  }
}

const getPartnerAggregates = async (partnerIds) => {
  if (!partnerIds.length) return new Map()

  const [companyCounts, ledgerRows] = await Promise.all([
    UserModel.findAll({
      attributes: [
        'referral_partner_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'companies_count'],
      ],
      where: {
        referral_partner_id: { [Op.in]: partnerIds },
        user_type: userRoles.manager.type,
      },
      group: ['referral_partner_id'],
      raw: true,
    }),
    ReferralLedgerTransactionModel.findAll({
      attributes: [
        'referral_partner_id',
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: { referral_partner_id: { [Op.in]: partnerIds } },
      group: ['referral_partner_id', 'type'],
      raw: true,
    }),
  ])

  const map = new Map()
  partnerIds.forEach((id) => {
    map.set(id, {
      companies_count: 0,
      total_earned: 0,
      total_paid: 0,
      balance: 0,
    })
  })

  companyCounts.forEach((row) => {
    const entry = map.get(row.referral_partner_id)
    if (entry) {
      entry.companies_count = Number(row.companies_count || 0)
    }
  })

  ledgerRows.forEach((row) => {
    const entry = map.get(row.referral_partner_id)
    if (!entry) return
    const total = Number(row.total || 0)
    if (REFERRAL_BONUS_TYPES.includes(row.type)) {
      entry.total_earned += total
    } else if (row.type === REFERRAL_LEDGER_TYPES.payment) {
      entry.total_paid += total
    }
  })

  map.forEach((entry) => {
    entry.total_earned = Number(entry.total_earned.toFixed(2))
    entry.total_paid = Number(entry.total_paid.toFixed(2))
    entry.balance = Number((entry.total_earned - entry.total_paid).toFixed(2))
  })

  return map
}

const create = async (payload, currentUser) => {
  assertAdmin(currentUser)
  const code = normalizeCode(payload.code)
  if (!code) {
    throw new ReferralPartnerConflictError('referral code is required')
  }

  try {
    return await ReferralPartnerModel.create({
      name: payload.name,
      phone: payload.phone || null,
      email: payload.email || null,
      code,
      status: payload.status || 'active',
    })
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ReferralPartnerConflictError('referral code already exists')
    }
    throw error
  }
}

const getAll = async (payload, currentUser) => {
  assertAdmin(currentUser)
  const { page = 1, limit = 10, name, status } = payload
  const offset = calculateOffSet(page, limit)
  const where = {}

  if (name) {
    where.name = { [Op.iLike]: `%${name}%` }
  }
  if (status) {
    where.status = status
  }

  const { count, rows } = await ReferralPartnerModel.findAndCountAll({
    where,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  const aggregates = await getPartnerAggregates(rows.map((row) => row.id))
  const data = rows.map((row) => {
    const summary = aggregates.get(row.id) || {
      companies_count: 0,
      total_earned: 0,
      total_paid: 0,
      balance: 0,
    }
    return {
      ...row.toJSON(),
      ...summary,
    }
  })

  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    data,
  }
}

const getById = async (id, currentUser) => {
  assertAdmin(currentUser)
  const partner = await ReferralPartnerModel.findByPk(id)
  if (!partner) {
    throw new ReferralPartnerNotFoundError(id)
  }

  const aggregates = await getPartnerAggregates([partner.id])
  const summary = aggregates.get(partner.id)

  const companies = await UserModel.findAll({
    where: {
      referral_partner_id: partner.id,
      user_type: userRoles.manager.type,
    },
    attributes: {
      exclude: ['password'],
    },
    include: [
      {
        model: SubscriptionModel,
        as: 'subscriptions',
        required: false,
        include: [
          {
            model: PackageModel,
            as: 'package',
            required: false,
            attributes: ['id', 'name', 'actual_price', 'discount_price'],
          },
        ],
      },
    ],
    order: [['id', 'DESC']],
  })

  const ledger = await ReferralLedgerTransactionModel.findAll({
    where: { referral_partner_id: partner.id },
    include: [
      {
        model: UserModel,
        as: 'company',
        required: false,
        attributes: ['id', 'name', 'username'],
      },
    ],
    order: [['id', 'DESC']],
  })

  return {
    ...partner.toJSON(),
    ...summary,
    companies: companies.map((company) => {
      const current =
        company.subscriptions?.sort(
          (a, b) => new Date(b.valid_to) - new Date(a.valid_to)
        )[0] || null
      return {
        id: company.id,
        name: company.name,
        username: company.username,
        email: company.email,
        phone: company.phone,
        status: company.status,
        current_package: current?.package
          ? {
              id: current.package.id,
              name: current.package.name,
              price: getEffectivePackagePrice(current.package),
            }
          : null,
        valid_to: current?.valid_to || null,
      }
    }),
    ledger,
  }
}

const updateById = async (id, payload, currentUser) => {
  assertAdmin(currentUser)
  const partner = await ReferralPartnerModel.findByPk(id)
  if (!partner) {
    throw new ReferralPartnerNotFoundError(id)
  }

  const updates = { ...payload }
  if (updates.code !== undefined) {
    updates.code = normalizeCode(updates.code)
  }

  try {
    await partner.update(updates)
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ReferralPartnerConflictError('referral code already exists')
    }
    throw error
  }

  return getById(id, currentUser)
}

const getLedger = async (id, payload, currentUser) => {
  assertAdmin(currentUser)
  const partner = await ReferralPartnerModel.findByPk(id)
  if (!partner) {
    throw new ReferralPartnerNotFoundError(id)
  }

  const { page = 1, limit = 20 } = payload
  const offset = calculateOffSet(page, limit)

  const { count, rows } = await ReferralLedgerTransactionModel.findAndCountAll({
    where: { referral_partner_id: id },
    include: [
      {
        model: UserModel,
        as: 'company',
        required: false,
        attributes: ['id', 'name', 'username'],
      },
    ],
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    data: rows,
  }
}

const recordPayment = async (id, payload, currentUser) => {
  assertAdmin(currentUser)
  const partner = await ReferralPartnerModel.findByPk(id)
  if (!partner) {
    throw new ReferralPartnerNotFoundError(id)
  }

  const amount = Number(payload.amount)
  if (!(amount > 0)) {
    throw new ReferralPartnerConflictError('payment amount must be positive')
  }

  const aggregates = await getPartnerAggregates([partner.id])
  const balance = aggregates.get(partner.id)?.balance || 0
  if (amount > balance) {
    throw new ReferralPartnerConflictError(
      `payment exceeds available balance (${balance})`
    )
  }

  const txn = await ReferralLedgerTransactionModel.create({
    referral_partner_id: partner.id,
    type: REFERRAL_LEDGER_TYPES.payment,
    amount,
    remarks: payload.remarks || 'Payment to referral partner',
    created_by: currentUser.id,
  })

  logger.info(
    { partner_id: partner.id, amount, actor_id: currentUser.id },
    'Referral payment recorded'
  )

  return txn
}

const linkCompany = async (id, payload, currentUser) => {
  assertAdmin(currentUser)
  const partner = await ReferralPartnerModel.findByPk(id)
  if (!partner) {
    throw new ReferralPartnerNotFoundError(id)
  }
  if (partner.status !== 'active') {
    throw new ReferralPartnerConflictError('referral partner is inactive')
  }

  const company = await UserModel.findByPk(payload.user_id)
  if (!company || company.user_type !== userRoles.manager.type) {
    throw new UserNotFoundError(payload.user_id)
  }

  if (company.referral_partner_id) {
    throw new ReferralPartnerConflictError(
      'company is already linked to a referral partner'
    )
  }

  await company.update({ referral_partner_id: partner.id })

  const currentSubscription =
    (await subscriptionService.getCurrentSubscription(company.id)) ||
    (await subscriptionService.getLatestSubscription(company.id))

  let bonus = null
  if (currentSubscription) {
    const packageRecord =
      currentSubscription.package ||
      (await PackageModel.findByPk(currentSubscription.package_id))

    bonus = await referralBonusService.creditForSubscription({
      partnerId: partner.id,
      companyUserId: company.id,
      subscription: currentSubscription,
      packageRecord,
      type: REFERRAL_LEDGER_TYPES.manual_link_bonus,
      createdBy: currentUser.id,
      remarks: 'Manually linked by Super Admin',
    })
  }

  logger.info(
    {
      partner_id: partner.id,
      company_id: company.id,
      actor_id: currentUser.id,
    },
    'Company linked to referral partner'
  )

  return {
    company: {
      id: company.id,
      name: company.name,
      username: company.username,
      referral_partner_id: company.referral_partner_id,
    },
    bonus,
  }
}

const referralService = {
  create,
  getAll,
  getById,
  updateById,
  getLedger,
  recordPayment,
  linkCompany,
}

export default referralService
