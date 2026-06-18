import bcryptjs from 'bcryptjs'
import { SubsriptionInActiveError } from '@errors/subscription.errors'
import {
  InvalidCredentialError,
  InvalidUsernameError,
  UserNameConflictError,
  UserNotFoundError,
} from '@errors/user.errors'
import SubscriptionModel from '@models/subscription'
import InvoiceConfig from '@models/invoice_config'
import UserModel from '@models/user'
// import { sendMail } from "./mailService.js";
import { sequelize } from '@utils/db'
import { Op } from 'sequelize'
import subscriptionService from '@services/subscription.service'
import vendorService from '@services/vendor.service'
import userRoles from '@utils/user-roles'
import userService from '@services/user.service'
import dayjs from 'dayjs'
import itemService from '@services/items.service'

const createManager = async (payload) => {
  const transaction = await sequelize.transaction()

  const existsingUser = await userService.getUserByUsername(payload.username)

  if (existsingUser) {
    throw new UserNameConflictError('username already taken')
  }

  try {
    const newUser = await UserModel.create(
      {
        name: payload.name,
        username: payload.username,
        password: payload.password,
        user_type: userRoles.manager.type,
        status: payload.status,
        parent_id: 1,
      },
      { transaction }
    )

    await subscriptionService.create(
      newUser.id,
      payload.package_id,
      transaction
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
    // sendMail(
    // 	insertData.username,
    // 	"Your Account Details",
    // 	"accountCreated",
    // 	{
    // 		username: insertData.username,
    // 		password: hashedPassword,
    // 	}
    // );

    await transaction.commit()
    await InvoiceConfig.create({
      name: newUser.name,
      number: 0,
      parent_id: newUser.id,
    })

    return newUser
  } catch (error) {
    console.log(error)
    await transaction.rollback()
    throw error
  }
}

const login = async (username, password) => {
  try {
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
    user.save()
    return user
  } catch (err) {
    console.log(err)
  }
}

const resetPassword = async (username, newPassword) => {
  const user = await UserModel.findOne({ where: { username } })

  if (!user) {
    throw new UserNotFoundError(username)
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10)
  await user.update({ password: hashedPassword })
}

const authService = {
  createManager,
  login,
  resetPassword,
}

export default authService
