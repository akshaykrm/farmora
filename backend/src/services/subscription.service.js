import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import UserModel from '@models/user'
import ReferralPartnerModel from '@models/referralpartner'
import checkoutService from '@services/checkout.service'
import referralBonusService from '@services/referral-bonus.service'
import { PackageNotFoundError } from '@errors/package.errors'
import { PermissionDeniedError } from '@errors/auth.errors'
import { UserNotFoundError } from '@errors/user.errors'
import dayjs from 'dayjs'
import { getEffectivePackagePrice } from '@utils/package-price'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'

class SubscriptionNotFoundError extends Error {
  constructor(id) {
    super(`subscription ${id} not found`)
    this.name = 'SubscriptionNotFoundError'
    this.code = 'SUBSCRIPTION_NOT_FOUND'
    this.statusCode = 404
  }
}

class ReferralAssignmentError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ReferralAssignmentError'
    this.code = 'REFERRAL_ASSIGNMENT_ERROR'
    this.statusCode = 400
  }
}

const assignReferralPartner = async ({
  userId,
  referralPartnerId,
  subscription,
  packageRecord,
  actorId,
  bonusType,
  remarks,
  creditBonus = true,
}) => {
  if (!referralPartnerId) return null

  const user = await UserModel.findByPk(userId)
  if (!user || user.user_type !== userRoles.manager.type) {
    throw new UserNotFoundError(userId)
  }

  if (
    user.referral_partner_id &&
    Number(user.referral_partner_id) !== Number(referralPartnerId)
  ) {
    throw new ReferralAssignmentError(
      'company is already linked to a different referral partner'
    )
  }

  if (Number(user.referral_partner_id) === Number(referralPartnerId)) {
    return null
  }

  const partner = await ReferralPartnerModel.findByPk(referralPartnerId)
  if (!partner) {
    throw new ReferralAssignmentError('referral partner not found')
  }
  if (partner.status !== 'active') {
    throw new ReferralAssignmentError('referral partner is inactive')
  }

  await user.update({ referral_partner_id: partner.id })

  if (!creditBonus) {
    return null
  }

  const packageForBonus =
    packageRecord ||
    subscription?.package ||
    (subscription?.package_id
      ? await PackageModel.findByPk(subscription.package_id)
      : null)

  if (!subscription || !packageForBonus) {
    return null
  }

  return referralBonusService.creditForSubscription({
    partnerId: partner.id,
    companyUserId: userId,
    subscription,
    packageRecord: packageForBonus,
    type: bonusType,
    createdBy: actorId || null,
    remarks,
  })
}

const subscriptionInclude = [
  {
    model: UserModel,
    as: 'user',
    required: false,
    attributes: [
      'id',
      'name',
      'username',
      'email',
      'user_type',
      'status',
      'referral_partner_id',
    ],
    include: [
      {
        model: ReferralPartnerModel,
        as: 'referral_partner',
        required: false,
        attributes: ['id', 'name', 'code', 'status'],
      },
    ],
  },
  {
    model: PackageModel,
    as: 'package',
    required: false,
    attributes: [
      'id',
      'name',
      'actual_price',
      'discount_price',
      'duration',
      'referral_bonus_type',
      'referral_bonus_value',
    ],
  },
]

const getLatestSubscription = async (userId) => {
  return SubscriptionModel.findOne({
    where: { user_id: userId },
    order: [
      ['valid_to', 'DESC'],
      ['id', 'DESC'],
    ],
    include: [
      {
        model: PackageModel,
        as: 'package',
        required: false,
      },
    ],
  })
}

const getCurrentSubscription = async (userId) => {
  const now = dayjs().toDate()
  return SubscriptionModel.findOne({
    where: {
      user_id: userId,
      valid_from: { [Op.lte]: now },
      valid_to: { [Op.gte]: now },
    },
    order: [
      ['valid_to', 'DESC'],
      ['id', 'DESC'],
    ],
    include: [
      {
        model: PackageModel,
        as: 'package',
        required: false,
      },
    ],
  })
}

const buildSubscriptionSummary = (subscription) => {
  if (!subscription) {
    return null
  }

  const validTo = dayjs(subscription.valid_to)
  const daysRemaining = Math.max(
    0,
    validTo.startOf('day').diff(dayjs().startOf('day'), 'day')
  )
  const packageRecord = subscription.package

  return {
    id: subscription.id,
    kind: subscription.kind,
    valid_from: subscription.valid_from,
    valid_to: subscription.valid_to,
    days_remaining: daysRemaining,
    expiring_soon: daysRemaining <= 10,
    package: packageRecord
      ? {
          id: packageRecord.id,
          name: packageRecord.name,
          price: getEffectivePackagePrice(packageRecord),
          actual_price: Number(packageRecord.actual_price),
          discount_price: Number(packageRecord.discount_price),
          duration: packageRecord.duration,
        }
      : null,
  }
}

const create = async (userId, packageId, options = {}) =>
  checkoutService.start(userId, packageId, { ...options, kind: 'initial' })

const renew = async (userId, packageId, actor = null, options = {}) => {
  if (actor && actor.user_type !== 'admin' && actor.id !== userId)
    throw new PermissionDeniedError()
  return checkoutService.start(userId, packageId, {
    ...options,
    kind: 'renewal',
  })
}

const getAll = async (payload, currentUser) => {
  const { page, limit, user_id } = payload
  const offset = (page - 1) * limit
  const where = {}

  if (currentUser.user_type === userRoles.admin.type) {
    if (user_id) {
      where.user_id = user_id
    }
  } else if (currentUser.user_type === userRoles.manager.type) {
    where.user_id = currentUser.id
  } else {
    throw new PermissionDeniedError()
  }

  const { count, rows } = await SubscriptionModel.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ['valid_to', 'DESC'],
      ['id', 'DESC'],
    ],
    include: subscriptionInclude,
    distinct: true,
    col: 'id',
  })

  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    data: rows,
  }
}

const getById = async (id, currentUser) => {
  const where = { id }

  if (currentUser.user_type === userRoles.manager.type) {
    where.user_id = currentUser.id
  } else if (currentUser.user_type !== userRoles.admin.type) {
    throw new PermissionDeniedError()
  }

  const record = await SubscriptionModel.findOne({
    where,
    include: subscriptionInclude,
  })

  if (!record) {
    throw new SubscriptionNotFoundError(id)
  }

  return record
}

const updateById = async (id, payload, currentUser) => {
  if (currentUser.user_type !== userRoles.admin.type) {
    throw new PermissionDeniedError()
  }

  const record = await getById(id, currentUser)
  const updates = {}
  let packageRecord = record.package || null

  if (payload.package_id) {
    packageRecord = await PackageModel.findByPk(payload.package_id)
    if (!packageRecord) {
      throw new PackageNotFoundError(payload.package_id)
    }
    updates.package_id = payload.package_id
    if (!payload.valid_from && !payload.valid_to) {
      updates.valid_from = dayjs().toDate()
      updates.valid_to = dayjs().add(packageRecord.duration, 'month').toDate()
    }
  }

  if (payload.valid_from) {
    updates.valid_from = payload.valid_from
  }
  if (payload.valid_to) {
    updates.valid_to = payload.valid_to
  }

  if (Object.keys(updates).length > 0) {
    await record.update(updates)
  }

  const updated = await getById(id, currentUser)

  if (payload.referral_partner_id) {
    await assignReferralPartner({
      userId: updated.user_id,
      referralPartnerId: payload.referral_partner_id,
      subscription: updated,
      packageRecord:
        packageRecord ||
        updated.package ||
        (await PackageModel.findByPk(updated.package_id)),
      actorId: currentUser.id,
      bonusType: referralBonusService.TYPES.manual_link_bonus,
      remarks: 'Referral assigned on subscription edit by Super Admin',
      creditBonus: true,
    })
  }

  return getById(id, currentUser)
}

const deleteById = async (id, currentUser) => {
  if (currentUser.user_type !== userRoles.admin.type) {
    throw new PermissionDeniedError()
  }
  const record = await getById(id, currentUser)
  await record.destroy()
}

const resolveSubscribeUserId = (payload, currentUser) => {
  if (currentUser.user_type === userRoles.admin.type) {
    if (!payload.user_id) {
      throw new PermissionDeniedError('user_id is required')
    }
    return payload.user_id
  }
  if (currentUser.user_type === userRoles.manager.type) {
    return currentUser.id
  }
  throw new PermissionDeniedError()
}

const createForUser = async (payload, currentUser) => {
  const userId = resolveSubscribeUserId(payload, currentUser)
  const user = await UserModel.findByPk(userId)
  if (!user) {
    throw new UserNotFoundError(userId)
  }
  if (
    currentUser.user_type === userRoles.admin.type &&
    user.user_type !== userRoles.manager.type
  ) {
    throw new PermissionDeniedError('subscriptions belong to subscribers')
  }
  return create(userId, payload.package_id, { request_id: payload.request_id })
}

const renewForUser = async (payload, currentUser) => {
  if (
    payload.referral_partner_id &&
    currentUser.user_type !== userRoles.admin.type
  ) {
    throw new PermissionDeniedError(
      'Only Super Admin can assign a referral partner'
    )
  }
  const userId = resolveSubscribeUserId(payload, currentUser)
  const user = await UserModel.findByPk(userId)
  if (!user) {
    throw new UserNotFoundError(userId)
  }
  if (
    currentUser.user_type === userRoles.admin.type &&
    user.user_type !== userRoles.manager.type
  ) {
    throw new PermissionDeniedError('subscriptions belong to subscribers')
  }
  return renew(userId, payload.package_id, currentUser, {
    referral_partner_id: payload.referral_partner_id,
    request_id: payload.request_id,
  })
}

const subscriptionService = {
  create,
  createForUser,
  renew,
  renewForUser,
  getAll,
  getById,
  updateById,
  deleteById,
  getLatestSubscription,
  getCurrentSubscription,
  buildSubscriptionSummary,
}

export default subscriptionService
