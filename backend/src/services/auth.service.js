import bcryptjs from 'bcryptjs'
import { SubsriptionInActiveError } from '@errors/subscription.errors'
import {
  InvalidCredentialError,
  InvalidCurrentPasswordError,
  InvalidUsernameError,
  UserNameConflictError,
  UserNotFoundError,
} from '@errors/user.errors'
import SubscriptionModel from '@models/subscription'
import InvoiceConfig from '@models/invoice_config'
import UserModel from '@models/user'
import PackageModel from '@models/package'
// import { sendMail } from "./mailService.js";
import { sequelize } from '@utils/db'
import logger from '@utils/logger'
import { Op } from 'sequelize'
import subscriptionService from '@services/subscription.service'
import vendorService from '@services/vendor.service'
import userRoles from '@utils/user-roles'
import userService from '@services/user.service'
import dayjs from 'dayjs'
import itemService from '@services/items.service'
import referralBonusService from '@services/referral-bonus.service'

const createManager = async (payload) => {
  const existsingUser = await userService.getUserByUsername(payload.username)

  if (existsingUser) {
    throw new UserNameConflictError('username already taken')
  }

  const existingEmailUser = await userService.getUserByEmail(payload.email)

  if (existingEmailUser) {
    throw new UserNameConflictError('email already taken')
  }

  let referralPartner = null
  if (payload.referral_code) {
    referralPartner = await referralBonusService.findActivePartnerByCode(
      payload.referral_code
    )
    if (!referralPartner) {
      const error = new Error('invalid referral code')
      error.statusCode = 400
      error.code = 'INVALID_REFERRAL_CODE'
      error.name = 'ValidationError'
      throw error
    }
  }

  const transaction = await sequelize.transaction()

  try {
    const newUser = await UserModel.create(
      {
        name: payload.name,
        username: payload.username,
        email: payload.email,
        phone: payload.phone,
        state: payload.state || null,
        district: payload.district || null,
        place: payload.place || null,
        pincode: payload.pincode || null,
        bird_capacity: payload.bird_capacity || null,
        password: payload.password,
        user_type: userRoles.manager.type,
        status: payload.status,
        parent_id: 1,
        referral_partner_id: referralPartner?.id || null,
      },
      { transaction }
    )

    const newSubscription = await subscriptionService.create(
      newUser.id,
      payload.package_id,
      {
        referralPartnerId: referralPartner?.id || null,
        creditBonus: false,
      }
    )

    const newVendor = await vendorService.createInternalVendor(newUser)

    await itemService.create(
      {
        name: 'Integration Cost',
        vendor_id: newVendor.id,
        type: 'integration',
      },
      newUser
    )

    await itemService.create(
      {
        name: 'Working Cost',
        vendor_id: newVendor.id,
        type: 'working',
      },
      newUser
    )

    await transaction.commit()
    await InvoiceConfig.create({
      name: newUser.name,
      number: 0,
      parent_id: newUser.id,
    })

    if (referralPartner?.id) {
      const packageRecord = await PackageModel.findByPk(payload.package_id)
      await referralBonusService.creditForSubscription({
        partnerId: referralPartner.id,
        companyUserId: newUser.id,
        subscription: newSubscription,
        packageRecord,
        type: referralBonusService.TYPES.initial_bonus,
        remarks: 'Initial subscription bonus',
      })
    }

    return newUser
  } catch (error) {
    logger.error({ err: error }, 'Manager creation failed')
    await transaction.rollback()
    throw error
  }
}

const login = async (username, password) => {
  if (!username) {
    throw new InvalidUsernameError(username)
  }
  const user = await UserModel.findOne({
    where: {
      username: username,
    },
    include: [
      {
        model: SubscriptionModel,
        as: 'subscriptions',
        required: false,
      },
      {
        model: UserModel,
        as: 'parent',
        required: false,
      },
    ],
  })

  if (!user) {
    throw new UserNotFoundError(username)
  }

  const passwordVerified = await user.comparePassword(password)
  if (!passwordVerified) {
    throw new InvalidCredentialError(username)
  }

  // Only check subscription for non-admin users
  if (user.user_type === userRoles.manager.type) {
    const now = dayjs().toDate()
    const activeSubscription = user.subscriptions.filter(
      (sub) =>
        dayjs(sub.valid_from).isBefore(now) &&
        dayjs(sub.valid_to).isAfter(now) &&
        !sub.deleted_at
    )

    if (activeSubscription.length === 0) {
      throw new SubsriptionInActiveError(user.id)
    }
  }

  if (user.user_type === userRoles.staff.type) {
    const parentUser = user.parent
    const subscriptions = await SubscriptionModel.findAll({
      where: {
        user_id: parentUser.id,
        deleted_at: {
          [Op.is]: null,
        },
        valid_from: {
          [Op.lte]: dayjs().toDate(),
        },
        valid_to: {
          [Op.gte]: dayjs().toDate(),
        },
      },
    })

    if (subscriptions.length === 0) {
      throw new SubsriptionInActiveError(parentUser.id)
    }
  }

  const date = dayjs().toDate()
  user.last_login = date
  await user.save()
  return user
}

const resetPassword = async (username, newPassword) => {
  const user = await UserModel.findOne({ where: { username } })

  if (!user) {
    throw new UserNotFoundError(username)
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10)
  await user.update({ password: hashedPassword })
}

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await UserModel.findByPk(userId)

  if (!user) {
    throw new UserNotFoundError(userId)
  }

  const passwordVerified = await user.comparePassword(currentPassword)
  if (!passwordVerified) {
    throw new InvalidCurrentPasswordError()
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10)
  await user.update({ password: hashedPassword })
}

const authService = {
  createManager,
  login,
  resetPassword,
  changePassword,
}

export default authService
