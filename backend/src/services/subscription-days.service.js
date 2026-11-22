import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { sequelize } from '@utils/db'
import SubscriptionModel from '@models/subscription'
import UserModel from '@models/user'
import { checkoutError } from '@errors/checkout.errors'

const updateDays = async (id, { days, expected_valid_to }, actor) => {
  if (actor.user_type !== 'admin')
    throw checkoutError(
      'Only Super Admin can adjust subscription days.',
      'PERMISSION_DENIED',
      403
    )
  const initial = await SubscriptionModel.findByPk(id)
  if (!initial)
    throw checkoutError(
      'Subscription not found.',
      'SUBSCRIPTION_NOT_FOUND',
      404
    )
  return sequelize.transaction(async (transaction) => {
    // Same owner-first lock order as checkout so renewal cannot race this adjustment.
    await UserModel.findByPk(initial.user_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    const record = await SubscriptionModel.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!record)
      throw checkoutError(
        'Subscription not found.',
        'SUBSCRIPTION_NOT_FOUND',
        404
      )
    if (+new Date(expected_valid_to) !== +new Date(record.valid_to))
      throw checkoutError(
        'Subscription expiry has changed. Close this dialog and try again with the latest dates.',
        'SUBSCRIPTION_CONFLICT',
        409
      )
    const validTo = dayjs(record.valid_to).add(days, 'day').toDate()
    if (validTo <= record.valid_from)
      throw checkoutError(
        'The expiry must be after the subscription start date.',
        'INVALID_SUBSCRIPTION_DATES',
        400
      )
    const overlap = await SubscriptionModel.findOne({
      where: {
        user_id: record.user_id,
        id: { [Op.ne]: record.id },
        valid_from: { [Op.lt]: validTo },
        valid_to: { [Op.gt]: record.valid_from },
      },
      transaction,
    })
    if (overlap)
      throw checkoutError(
        'The new dates overlap another subscription. Review this subscriber’s subscription history first.',
        'SUBSCRIPTION_OVERLAP',
        409
      )
    await record.update({ valid_to: validTo }, { transaction })
    return {
      id: record.id,
      valid_from: record.valid_from,
      valid_to: record.valid_to,
    }
  })
}
export default { updateDays }
