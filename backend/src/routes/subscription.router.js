import { Router } from 'express'
import Joi from 'joi'
import asyncHandler from '@utils/async-handler'
import subscriptionDays from '@services/subscription-days.service'
import {
  isAuthenticated,
  isSuperAdmin,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import subscriptionController from '@controllers/subscription.controller'
import validate, { validateQuery } from '@utils/validate-request'
import freeTrial from '@services/free-trial.service'
import UserModel from '@models/user'
import { checkoutError } from '@errors/checkout.errors'
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
  '/package-options',
  isAuthenticated,
  validateQuery(
    Joi.object({ user_id: Joi.number().integer().positive().optional() })
  ),
  asyncHandler(async (req, res) => {
    const id = req.query.user_id ? Number(req.query.user_id) : req.user.id
    if (
      req.user.user_type !== 'admin' &&
      (req.user.user_type !== 'manager' || id !== req.user.id)
    )
      throw checkoutError('Permission denied.', 'PERMISSION_DENIED', 403)
    const user = await UserModel.findByPk(id)
    if (!user)
      throw checkoutError('Subscriber not found.', 'USER_NOT_FOUND', 404)
    const eligible = await freeTrial.availablePackages(user)
    res.success(
      eligible.packages.map((plan) => ({ id: plan.id, name: plan.name }))
    )
  })
)

subscriptionRouter.get(
  '/:subscription_id',
  isAuthenticated,
  requirePermission(P.subscription_read),
  subscriptionController.getById
)

subscriptionRouter.put(
  '/:subscription_id/days',
  isAuthenticated,
  isSuperAdmin,
  validate(
    Joi.object({
      days: Joi.number().integer().min(-3650).max(3650).invalid(0).required(),
      expected_valid_to: Joi.date().iso().required(),
    })
  ),
  asyncHandler(async (req, res) =>
    res.success(
      await subscriptionDays.updateDays(
        req.params.subscription_id,
        req.body,
        req.user
      ),
      { message: 'Subscription days updated' }
    )
  )
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
