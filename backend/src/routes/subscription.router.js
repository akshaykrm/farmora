import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import subscriptionController from '@controllers/subscription.controller'
import validate from '@utils/validate-request'
import {
  createSubscriptionSchema,
  renewSubscriptionSchema,
  updateSubscriptionSchema,
} from '@validators/subscription.validator'

const subscriptionRouter = Router()

subscriptionRouter.post(
  '/subscribe',
  isAuthenticated,
  validate(createSubscriptionSchema),
  subscriptionController.create
)

subscriptionRouter.post(
  '/renew',
  isAuthenticated,
  validate(renewSubscriptionSchema),
  subscriptionController.renew
)

subscriptionRouter.get(
  '/',
  isAuthenticated,
  requirePermission(P.subscription_read),
  subscriptionController.getAll
)

subscriptionRouter.get(
  '/:subscription_id',
  isAuthenticated,
  requirePermission(P.subscription_read),
  subscriptionController.getById
)

subscriptionRouter.put(
  '/:subscription_id',
  isAuthenticated,
  requirePermission(P.subscription_edit),
  validate(updateSubscriptionSchema),
  subscriptionController.updateById
)

subscriptionRouter.delete(
  '/:subscription_id',
  isAuthenticated,
  requirePermission(P.subscription_delete),
  subscriptionController.deleteById
)

export default subscriptionRouter
