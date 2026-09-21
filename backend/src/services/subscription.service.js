import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import UserModel from '@models/user'
import paymentService from '@services/payment.service'
import referralBonusService from '@services/referral-bonus.service'
import {
  SubsriptionAlreadyActiveError,
} from '@errors/subscription.errors'
import { PackageNotFoundError } from '@errors/package.errors'
import { PermissionDeniedError } from '@errors/auth.errors'
import { UserNotFoundError } from '@errors/user.errors'
import dayjs from 'dayjs'
import logger from '@utils/logger'
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

class NoSubscriptionToRenewError extends Error {
  constructor(userId) {
    super(`no subscription found to renew for user ${userId}`)
    this.name = 'NoSubscriptionToRenewError'
    this.code = 'NO_SUBSCRIPTION_TO_RENEW'
    this.statusCode = 400
  }
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
    order: [['valid_to', 'DESC'], ['id', 'DESC']],
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
    order: [['valid_to', 'DESC'], ['id', 'DESC']],
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
  const daysRemaining = Math.max(0, validTo.startOf('day').diff(dayjs().startOf('day'), 'day'))
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

const create = async (userID, packageID, options = {}) => {
  const existing = await SubscriptionModel.findOne({
    where: { user_id: userID },
  })

  if (existing) {
    throw new SubsriptionAlreadyActiveError(userID)
  }

  const packageRecord = await PackageModel.findByPk(packageID)
  if (!packageRecord) {
    throw new PackageNotFoundError(packageID)
  }

  const validFrom = dayjs().toDate()
  const validTo = dayjs().add(packageRecord.duration, 'month').toDate()

  logger.info({ userID, packageID }, 'Creating subscription')
  const newSubscription = await SubscriptionModel.create({
    user_id: userID,
    package_id: packageID,
    valid_from: validFrom,
    valid_to: validTo,
    kind: 'initial',
  })
  logger.info({ subscription_id: newSubscription.id }, 'Subscription created')

  await paymentService.process(
    userID,
    newSubscription.id,
    'card',
    getEffectivePackagePrice(packageRecord)
  )

  const user = await UserModel.findByPk(userID)
  const partnerId =
    options.referralPartnerId || user?.referral_partner_id || null
  if (partnerId && options.creditBonus !== false) {
    await referralBonusService.creditForSubscription({
      partnerId,
      companyUserId: userID,
      subscription: newSubscription,
      packageRecord,
      type: referralBonusService.TYPES.initial_bonus,
      remarks: 'Initial subscription bonus',
    })
  }

  return newSubscription
}

const renew = async (userId, packageId, actor = null) => {
  const latest = await getLatestSubscription(userId)
  if (!latest) {
    throw new NoSubscriptionToRenewError(userId)
  }

  const packageRecord = await PackageModel.findByPk(packageId)
  if (!packageRecord) {
    throw new PackageNotFoundError(packageId)
  }

  const validFromCandidate = dayjs(latest.valid_to)
  const validFrom = (
    validFromCandidate.isAfter(dayjs()) ? validFromCandidate : dayjs()
  ).toDate()
  const validTo = dayjs(validFrom).add(packageRecord.duration, 'month').toDate()

  logger.info({ userId, packageId, actor_id: actor?.id }, 'Renewing subscription')
  const renewed = await SubscriptionModel.create({
    user_id: userId,
    package_id: packageId,
    valid_from: validFrom,
    valid_to: validTo,
    kind: 'renewal',
  })

  await paymentService.process(
    userId,
    renewed.id,
    'card',
    getEffectivePackagePrice(packageRecord)
  )

  const user = await UserModel.findByPk(userId)
  if (user?.referral_partner_id) {
    await referralBonusService.creditForSubscription({
      partnerId: user.referral_partner_id,
      companyUserId: userId,
      subscription: renewed,
      packageRecord,
      type: referralBonusService.TYPES.renewal_bonus,
      createdBy: actor?.id || null,
      remarks: 'Renewal bonus',
    })
  }

  return SubscriptionModel.findByPk(renewed.id, { include: subscriptionInclude })
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

  logger.debug({ payload, where }, 'Fetching subscriptions')

  const { count, rows } = await SubscriptionModel.findAndCountAll({
    where,
    limit,
    offset,
    order: [['id', 'DESC']],
    include: subscriptionInclude,
  })

  logger.info({ page, limit, count }, 'Subscriptions fetched')

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

  if (payload.package_id) {
    const packageRecord = await PackageModel.findByPk(payload.package_id)
    if (!packageRecord) {
      throw new PackageNotFoundError(payload.package_id)
    }
    updates.package_id = payload.package_id
    if (!payload.valid_from && !payload.valid_to) {
      updates.valid_from = dayjs().toDate()
      updates.valid_to = dayjs()
        .add(packageRecord.duration, 'month')
        .toDate()
    }
  }

  if (payload.valid_from) {
    updates.valid_from = payload.valid_from
  }
  if (payload.valid_to) {
    updates.valid_to = payload.valid_to
  }

  await record.update(updates)
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
  return create(userId, payload.package_id)
}

const renewForUser = async (payload, currentUser) => {
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
  return renew(userId, payload.package_id, currentUser)
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
