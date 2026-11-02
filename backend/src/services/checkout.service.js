import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { sequelize } from '@utils/db'
import { getEffectivePackagePrice } from '@utils/package-price'
import { checkoutError } from '@errors/checkout.errors'
import CheckoutOrder from '@models/checkoutorder'
import UserModel from '@models/user'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import PaymentModel from '@models/payment'
import ReferralPartnerModel from '@models/referralpartner'
import referralBonus from './referral-bonus.service.js'
import razorpay, { verifySignature } from './razorpay.service.js'
import paymentSettings from './payment-settings.service.js'

const assertOwner = (order, actor) => {
  if (!order || (actor.user_type !== 'admin' && order.user_id !== actor.id)) {
    throw checkoutError('Checkout not found.', 'CHECKOUT_NOT_FOUND', 404)
  }
}

const activate = async (order, user, transaction, payment = null) => {
  if (order.status === 'completed') return order
  const options = { transaction }
  const latest = await SubscriptionModel.findOne({
    where: { user_id: user.id },
    order: [['valid_to', 'DESC']],
    ...options,
  })
  if (order.kind === 'initial' && latest) {
    throw checkoutError(
      'This account already has a subscription. Contact support to reconcile payment.',
      'SUBSCRIPTION_CONFLICT',
      409
    )
  }
  const now = dayjs()
  const from =
    order.kind === 'renewal' && latest && dayjs(latest.valid_to).isAfter(now)
      ? dayjs(latest.valid_to)
      : now
  const subscription = await SubscriptionModel.create(
    {
      user_id: user.id,
      package_id: order.package_id,
      kind: order.kind,
      valid_from: from.toDate(),
      valid_to: from.add(order.package_snapshot.duration, 'month').toDate(),
    },
    options
  )
  await PaymentModel.create(
    {
      user_id: user.id,
      subscription_id: subscription.id,
      amount: (order.amount / 100).toFixed(2),
      payment_method: payment?.method || 'free',
      transaction_id: payment?.id || `free_${order.id}`,
      status: 'completed',
    },
    options
  )
  if (order.referral_partner_id && !user.referral_partner_id) {
    await user.update(
      { referral_partner_id: order.referral_partner_id },
      options
    )
  }
  if (order.amount > 0 && order.referral_partner_id) {
    await referralBonus.creditForSubscription({
      partnerId: order.referral_partner_id,
      companyUserId: user.id,
      subscription,
      packageRecord: order.package_snapshot,
      partnerRecord: order.referral_snapshot,
      transaction,
      type: order.kind === 'renewal' ? 'renewal_bonus' : 'initial_bonus',
      remarks: 'Verified Razorpay package payment',
    })
  }
  await order.update(
    {
      status: 'completed',
      subscription_id: subscription.id,
      razorpay_payment_id: payment?.id || null,
    },
    options
  )
  return order
}

// Caller owns the user lock. Signup also uses this inside its account transaction.
const prepare = async (
  user,
  packageId,
  kind,
  requestId,
  transaction,
  referralId
) => {
  if (user.user_type !== 'manager')
    throw checkoutError(
      'Only subscribers can purchase a package.',
      'PERMISSION_DENIED',
      403
    )
  const options = { transaction }
  let order = await CheckoutOrder.findOne({
    where: { request_id: requestId },
    ...options,
  })
  if (order) {
    if (
      order.user_id !== user.id ||
      order.package_id !== packageId ||
      order.kind !== kind
    ) {
      throw checkoutError(
        'Checkout request does not match the original purchase.',
        'CHECKOUT_CONFLICT',
        409
      )
    }
    return order
  }
  // Reuse unpaid attempts, including after refresh or a lost signup response.
  order = await CheckoutOrder.findOne({
    where: { user_id: user.id, status: 'pending', kind },
    ...options,
  })
  if (order) {
    if (order.package_id !== packageId)
      throw checkoutError(
        'Finish the existing package checkout first.',
        'CHECKOUT_CONFLICT',
        409
      )
    if (kind === 'renewal' && order.request_id !== requestId) {
      throw Object.assign(
        checkoutError(
          'Resume the existing renewal checkout.',
          'CHECKOUT_PENDING',
          409
        ),
        {
          details: { request_id: order.request_id },
        }
      )
    }
    return order
  }
  const plan = await PackageModel.findOne({
    where: { id: packageId, status: 'active' },
    ...options,
  })
  if (
    !plan ||
    !plan.role_id ||
    !Number.isInteger(plan.duration) ||
    plan.duration <= 0
  ) {
    throw checkoutError(
      'Package is not available for purchase.',
      'PACKAGE_NOT_FOUND',
      404
    )
  }
  const latest = await SubscriptionModel.findOne({
    where: { user_id: user.id },
    ...options,
  })
  if ((kind === 'initial' && latest) || (kind === 'renewal' && !latest)) {
    throw checkoutError(
      'Invalid subscription purchase type.',
      'SUBSCRIPTION_CONFLICT',
      409
    )
  }
  const amount = Math.round(getEffectivePackagePrice(plan) * 100)
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 2147483647) {
    throw checkoutError('Package price is outside supported limits.')
  }
  if (
    referralId &&
    user.referral_partner_id &&
    referralId !== user.referral_partner_id
  ) {
    throw checkoutError(
      'Account is already linked to another referral partner.'
    )
  }
  const partnerId = user.referral_partner_id || referralId || null
  const partner = partnerId
    ? await ReferralPartnerModel.findByPk(partnerId, options)
    : null
  if (referralId && (!partner || partner.status !== 'active'))
    throw checkoutError('Referral partner is inactive or missing.')
  order = await CheckoutOrder.create(
    {
      request_id: requestId,
      user_id: user.id,
      package_id: packageId,
      kind,
      amount,
      currency: 'INR',
      package_snapshot: plan.toJSON(),
      referral_partner_id: partnerId,
      referral_snapshot: partner?.toJSON() || null,
    },
    options
  )
  if (amount === 0) await activate(order, user, transaction)
  return order
}

const present = async (order) => {
  const user = await UserModel.findByPk(order.user_id)
  const credentials = order.razorpay_order_id
    ? await paymentSettings.credentials(order.gateway_settings_id)
    : null
  return {
    id: order.id,
    kind: order.kind,
    request_id: order.request_id,
    status: order.status,
    checkout_required: order.status !== 'completed',
    subscription_id: order.subscription_id,
    package_id: order.package_id,
    package_name: order.package_snapshot.name,
    amount: order.amount,
    currency: order.currency,
    razorpay_order_id: order.razorpay_order_id,
    key_id: credentials?.key_id || null,
    customer: { name: user.name, email: user.email, contact: user.phone },
  }
}

const start = async (
  userId,
  packageId,
  { kind = 'initial', request_id, referral_partner_id } = {}
) => {
  if (!request_id) throw checkoutError('Checkout request ID is required.')
  const order = await sequelize.transaction(async (transaction) => {
    const user = await UserModel.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!user)
      throw checkoutError('Subscriber not found.', 'USER_NOT_FOUND', 404)
    if (user.approval_status !== 'approved')
      throw checkoutError(
        'Approve this account before checkout.',
        'ACCOUNT_APPROVAL_REQUIRED',
        403
      )
    return prepare(
      user,
      packageId,
      kind,
      request_id,
      transaction,
      referral_partner_id
    )
  })
  if (order.status === 'completed') return present(order)
  // Serialize order creation so concurrent retries return the same payable order.
  await sequelize.transaction(async (transaction) => {
    const locked = await CheckoutOrder.findByPk(order.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (locked.razorpay_order_id || locked.status === 'completed') return
    const credentials = await paymentSettings.credentials()
    const remote = await razorpay.createOrder(locked, credentials)
    if (
      remote.amount !== locked.amount ||
      remote.currency !== locked.currency ||
      !remote.id
    ) {
      throw checkoutError(
        'Payment order does not match checkout.',
        'PAYMENT_MISMATCH',
        502
      )
    }
    await locked.update(
      {
        razorpay_order_id: remote.id,
        gateway_settings_id: credentials.version,
      },
      { transaction }
    )
  })
  await order.reload()
  return present(order)
}

const complete = async (orderId, payment) => {
  const record = await CheckoutOrder.findByPk(orderId)
  if (!record)
    throw checkoutError('Checkout not found.', 'CHECKOUT_NOT_FOUND', 404)
  if (
    payment.status !== 'captured' ||
    payment.order_id !== record.razorpay_order_id ||
    payment.amount !== record.amount ||
    payment.currency !== record.currency ||
    !payment.id
  )
    throw checkoutError(
      'Payment is not captured or does not match checkout.',
      'PAYMENT_NOT_CAPTURED',
      409
    )
  return sequelize.transaction(async (transaction) => {
    // Same lock order as prepare: account first, then checkout.
    const user = await UserModel.findByPk(record.user_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    const order = await CheckoutOrder.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (order.razorpay_payment_id && order.razorpay_payment_id !== payment.id) {
      throw checkoutError(
        'Checkout was completed with another payment.',
        'PAYMENT_MISMATCH',
        409
      )
    }
    return activate(order, user, transaction, payment)
  })
}

const verify = async (id, payload, actor) => {
  const order = await CheckoutOrder.findByPk(id)
  assertOwner(order, actor)
  const credentials = await paymentSettings.credentials(
    order.gateway_settings_id
  )
  if (
    payload.razorpay_order_id !== order.razorpay_order_id ||
    !verifySignature(
      `${order.razorpay_order_id}|${payload.razorpay_payment_id}`,
      payload.razorpay_signature,
      credentials.key_secret
    )
  )
    throw checkoutError(
      'Invalid payment signature.',
      'INVALID_PAYMENT_SIGNATURE',
      400
    )
  const payment = await razorpay.fetchPayment(
    payload.razorpay_payment_id,
    order
  )
  if (payment.id !== payload.razorpay_payment_id)
    throw checkoutError('Payment ID mismatch.')
  return present(await complete(order.id, payment))
}

const status = async (id, actor) => {
  const order = await CheckoutOrder.findByPk(id)
  assertOwner(order, actor)
  if (order.status === 'pending' && order.razorpay_order_id) {
    const remote = await razorpay.fetchOrderPayments(order)
    const captured = remote.items?.find(
      (payment) => payment.status === 'captured'
    )
    if (captured) return present(await complete(order.id, captured))
  }
  return present(order)
}

const session = async (actor) => {
  const order = await CheckoutOrder.findOne({
    where: { user_id: actor.id },
    order: [['created_at', 'DESC']],
  })
  const orderData = order ? await status(order.id, actor) : null
  const plans = await PackageModel.findAll({
    where: { status: 'active' },
    attributes: ['id', 'name', 'actual_price', 'discount_price', 'duration'],
  })
  const subscription = await SubscriptionModel.findOne({
    where: { user_id: actor.id },
    order: [['valid_to', 'DESC']],
  })
  const active = await SubscriptionModel.count({
    where: {
      user_id: actor.id,
      valid_from: { [Op.lte]: new Date() },
      valid_to: { [Op.gt]: new Date() },
    },
  })
  return {
    order: orderData,
    active: active > 0,
    kind: subscription ? 'renewal' : 'initial',
    packages: plans,
    request_id:
      orderData?.status === 'pending' ? order.request_id : randomUUID(),
  }
}

const webhook = async (raw, signature) => {
  let event
  try {
    event = JSON.parse(raw.toString('utf8'))
  } catch {
    throw checkoutError('Invalid webhook body.')
  }
  const entity = event.payload?.payment?.entity
  const order = entity?.order_id
    ? await CheckoutOrder.findOne({
        where: { razorpay_order_id: entity.order_id },
      })
    : null
  const credentials = await paymentSettings.credentials(
    order?.gateway_settings_id
  )
  if (!verifySignature(raw, signature, credentials.webhook_secret)) {
    throw checkoutError(
      'Invalid webhook signature.',
      'INVALID_WEBHOOK_SIGNATURE',
      400
    )
  }
  if (!['payment.captured', 'order.paid'].includes(event.event) || !order)
    return
  const payment = await razorpay.fetchPayment(entity.id, order)
  await complete(order.id, payment)
}

export default { prepare, start, present, verify, status, session, webhook }
