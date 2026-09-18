import subscriptionService from '@services/subscription.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'

const create = async (req, res) => {
  logger.info(
    { package_id: req.body.package_id, actor_id: req.user.id },
    'Create subscription request received'
  )
  const newSubscription = await subscriptionService.createForUser(
    req.body,
    req.user
  )

  res.success(newSubscription, {
    message: 'Subscription created successfully',
    statusCode: 201,
  })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    user_id: req.query.user_id,
  }

  const subscriptionRecords = await subscriptionService.getAll(filter, req.user)
  res.success(subscriptionRecords, {
    message: 'Subscriptions fetched successfully',
  })
}

const getById = async (req, res) => {
  const record = await subscriptionService.getById(
    req.params.subscription_id,
    req.user
  )
  res.success(record, { message: 'Subscription details' })
}

const updateById = async (req, res) => {
  const record = await subscriptionService.updateById(
    req.params.subscription_id,
    req.body,
    req.user
  )
  res.success(record, { message: 'Subscription updated' })
}

const deleteById = async (req, res) => {
  await subscriptionService.deleteById(req.params.subscription_id, req.user)
  res.success(null, { message: 'Subscription deleted' })
}

const renew = async (req, res) => {
  logger.info(
    { package_id: req.body.package_id, actor_id: req.user.id },
    'Renew subscription request received'
  )
  const renewed = await subscriptionService.renewForUser(req.body, req.user)
  res.success(renewed, {
    message: 'Subscription renewed successfully',
    statusCode: 201,
  })
}

const subscriptionController = {
  create: asyncHandler(create),
  renew: asyncHandler(renew),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deleteById: asyncHandler(deleteById),
}

export default subscriptionController
