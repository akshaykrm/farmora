import { Op } from 'sequelize'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'

const read = async (ownerId, transaction = null) => {
  const used = await UserModel.count({
    where: { parent_id: ownerId, user_type: 'staff' },
    transaction,
  })
  const now = new Date()
  const subscription = await SubscriptionModel.findOne({
    where: {
      user_id: ownerId,
      valid_from: { [Op.lte]: now },
      valid_to: { [Op.gt]: now },
    },
    order: [
      ['valid_to', 'DESC'],
      ['id', 'DESC'],
    ],
    include: [{ model: PackageModel, as: 'package', required: true }],
    transaction,
  })
  const limit = subscription ? subscription.package.user_limit : 0
  return {
    used,
    limit,
    remaining: limit == null ? null : Math.max(0, limit - used),
    can_create: !!subscription && (limit == null || used < limit),
    package_name: subscription?.package?.name || null,
    subscription_active: !!subscription,
  }
}
export default { read }
