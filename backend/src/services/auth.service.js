import bcryptjs from 'bcryptjs'
import { assertAccountApproved } from '@services/account-approval.service'
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
import { Op } from 'sequelize'
import VendorModel from '@models/vendor'
import checkoutService from '@services/checkout.service'
import { randomUUID } from 'node:crypto'
import userRoles from '@utils/user-roles'
import userService from '@services/user.service'
import dayjs from 'dayjs'
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

  const packageRecord = payload.package_id
    ? await PackageModel.findByPk(payload.package_id)
    : await PackageModel.findOne({ where: { name: 'Basic', status: 'active' } })
  if (!packageRecord || packageRecord.status !== 'active') {
    throw Object.assign(new Error('Package is not available.'), {
      statusCode: 404,
      code: 'PACKAGE_NOT_FOUND',
    })
  }
  return sequelize.transaction(async (transaction) => {
    const user = await UserModel.create(
      {
        name: payload.name,
        username: payload.username,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        state: payload.state || null,
        district: payload.district || null,
        place: payload.place || null,
        pincode: payload.pincode || null,
        bird_capacity: payload.bird_capacity || null,
        user_type: userRoles.manager.type,
        status: 1,
        approval_status:
          packageRecord.name.trim().toLowerCase() === 'basic'
            ? 'approved'
            : 'pending',
        requested_package_id: packageRecord.id,
        parent_id: 1,
        referral_partner_id: referralPartner?.id || null,
      },
      { transaction }
    )
    await VendorModel.create(
      {
        master_id: user.id,
        name: 'Internal',
        vendor_type: 'internal',
        address: 'nil',
        opening_balance: 0,
        status: 'active',
      },
      { transaction }
    )
    await InvoiceConfig.create(
      { name: user.name, number: 0, parent_id: user.id },
      { transaction }
    )
    if (user.approval_status === 'pending') {
      user.setDataValue('approval_required', true)
      user.setDataValue('checkout_required', false)
      return user
    }
    const order = await checkoutService.prepare(
      user,
      packageRecord.id,
      'initial',
      randomUUID(),
      transaction
    )
    user.setDataValue('checkout_required', order.status !== 'completed')
    return user
  })
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

  await assertAccountApproved(user)

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
      user.setDataValue('checkout_required', true)
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
