import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import CheckoutOrder from '@models/checkoutorder'
import { getEffectivePackagePrice } from '@utils/package-price'
import { checkoutError } from '@errors/checkout.errors'

const hasUsed = async (user, transaction = null) => {
  if (user.free_trial_used_at) return true
  const order = await CheckoutOrder.findOne({
    where: { user_id: user.id, amount: 0, status: 'completed' },
    transaction,
  })
  if (order) return true
  // Legacy/seeded subscriptions may predate checkout and the usage marker.
  const history = await SubscriptionModel.findAll({
    where: { user_id: user.id },
    attributes: ['id'],
    paranoid: false,
    transaction,
    include: [
      {
        model: PackageModel,
        as: 'package',
        required: true,
        paranoid: false,
        attributes: ['actual_price', 'discount_price'],
      },
    ],
  })
  return history.some((sub) => getEffectivePackagePrice(sub.package) === 0)
}
const assertEligible = async (user, transaction) => {
  if (await hasUsed(user, transaction))
    throw checkoutError(
      'Your free trial has already been used. Choose a paid package to continue.',
      'FREE_TRIAL_ALREADY_USED',
      403
    )
}
const availablePackages = async (user) => {
  const plans = await PackageModel.findAll({ where: { status: 'active' } })
  const used = await hasUsed(user)
  return {
    free_trial_used: used,
    packages: used
      ? plans.filter((plan) => getEffectivePackagePrice(plan) > 0)
      : plans,
  }
}
export default { hasUsed, assertEligible, availablePackages }
