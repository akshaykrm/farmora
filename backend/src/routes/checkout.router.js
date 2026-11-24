import { Router } from 'express'
import { assertAccountApproved } from '@services/account-approval.service'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'
import { Op } from 'sequelize'
import CONFIG from '../../config.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import { generateToken } from '@utils/jwt'
import validate from '@utils/validate-request'
import asyncHandler from '@utils/async-handler'
import checkout from '@services/checkout.service'
import permissionService, { getMasterId } from '@services/permission.service'
import { checkoutError } from '@errors/checkout.errors'

const router = Router()
router.param('id', (req, _, next, value) => {
  if (Joi.string().uuid().validate(value).error)
    return next(checkoutError('Invalid checkout ID.'))
  next()
})
router.use(
  asyncHandler(async (req, _, next) => {
    let decoded
    try {
      decoded = jwt.verify(
        req.headers.authorization?.split(' ')[1],
        CONFIG.jwt_secret
      )
    } catch {
      throw checkoutError(
        'Sign in again to continue checkout.',
        'UNAUTHORIZED',
        401
      )
    }
    if (decoded.purpose && decoded.purpose !== 'checkout')
      throw checkoutError('Invalid session.', 'UNAUTHORIZED', 401)
    const user = await UserModel.findByPk(decoded.id)
    if (!user || !['manager', 'admin'].includes(user.user_type))
      throw checkoutError('Permission denied.', 'PERMISSION_DENIED', 403)
    await assertAccountApproved(user)
    req.user = user
    next()
  })
)

router.get(
  '/session',
  asyncHandler(async (req, res) =>
    res.success(await checkout.session(req.user))
  )
)
router.post(
  '/orders',
  validate(
    Joi.object({
      package_id: Joi.number().integer().positive().required(),
      kind: Joi.string().valid('initial', 'renewal').required(),
      request_id: Joi.string().uuid().required(),
      user_id: Joi.number().integer().positive().optional(),
      referral_partner_id: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    if (
      req.body.user_id &&
      req.body.user_id !== req.user.id &&
      req.user.user_type !== 'admin'
    ) {
      throw checkoutError('Permission denied.', 'PERMISSION_DENIED', 403)
    }
    if (req.body.referral_partner_id && req.user.user_type !== 'admin') {
      throw checkoutError(
        'Only Super Admin can assign a referral partner.',
        'PERMISSION_DENIED',
        403
      )
    }
    res.success(
      await checkout.start(
        req.body.user_id || req.user.id,
        req.body.package_id,
        req.body
      )
    )
  })
)
router.get(
  '/orders/:id',
  asyncHandler(async (req, res) =>
    res.success(await checkout.status(req.params.id, req.user))
  )
)
router.post(
  '/orders/:id/verify',
  validate(
    Joi.object({
      razorpay_order_id: Joi.string().max(100).required(),
      razorpay_payment_id: Joi.string().max(100).required(),
      razorpay_signature: Joi.string().length(64).hex().required(),
    })
  ),
  asyncHandler(async (req, res) =>
    res.success(await checkout.verify(req.params.id, req.body, req.user))
  )
)

router.post(
  '/access',
  asyncHandler(async (req, res) => {
    const active = await SubscriptionModel.findOne({
      where: {
        user_id: req.user.id,
        valid_from: { [Op.lte]: dayjs().toDate() },
        valid_to: { [Op.gt]: dayjs().toDate() },
      },
    })
    if (!active)
      throw checkoutError(
        'Complete payment before opening your farm.',
        'PAYMENT_REQUIRED',
        403
      )
    const user = req.user
    res.success({
      token: generateToken(user),
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      parent_id: user.parent_id,
      master_id: getMasterId(user),
      permissions: await permissionService.resolvePermissionKeys(user),
    })
  })
)

export default router
