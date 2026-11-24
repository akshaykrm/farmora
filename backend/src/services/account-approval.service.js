import { randomUUID } from 'node:crypto'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import { sequelize } from '@utils/db'
import { checkoutError } from '@errors/checkout.errors'
import checkout from '@services/checkout.service'

export const assertAccountApproved = async (user) => {
  if (user.user_type === 'admin') return
  const owner =
    user.user_type === 'staff' ? await UserModel.findByPk(user.parent_id) : user
  if (!owner || owner.approval_status !== 'approved') {
    throw checkoutError(
      'Your account is awaiting admin approval. Please contact the administrator.',
      'ACCOUNT_APPROVAL_REQUIRED',
      403
    )
  }
}

export const approveAccount = async (userId, admin) => {
  if (admin.user_type !== 'admin')
    throw checkoutError('Permission denied.', 'PERMISSION_DENIED', 403)
  return sequelize.transaction(async (transaction) => {
    const user = await UserModel.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!user || user.user_type !== 'manager')
      throw checkoutError('Subscriber not found.', 'USER_NOT_FOUND', 404)
    if (user.approval_status === 'approved')
      return { approval_status: 'approved' }
    await user.update(
      {
        approval_status: 'approved',
        approved_at: new Date(),
        approved_by: admin.id,
      },
      { transaction }
    )
    // Restoring access must preserve existing subscriptions, including expired ones.
    const subscription = await SubscriptionModel.findOne({
      where: { user_id: user.id },
      transaction,
    })
    if (!subscription && user.requested_package_id) {
      await checkout.prepare(
        user,
        user.requested_package_id,
        'initial',
        randomUUID(),
        transaction
      )
    }
    return { approval_status: user.approval_status }
  })
}

export const revokeAccountApproval = async (userId, admin) => {
  if (admin.user_type !== 'admin')
    throw checkoutError('Permission denied.', 'PERMISSION_DENIED', 403)
  return sequelize.transaction(async (transaction) => {
    const user = await UserModel.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!user || user.user_type !== 'manager')
      throw checkoutError('Subscriber not found.', 'USER_NOT_FOUND', 404)
    await user.update({ approval_status: 'pending' }, { transaction })
    return { approval_status: user.approval_status }
  })
}
