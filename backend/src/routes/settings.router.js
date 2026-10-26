import { Router } from 'express'
import Joi from 'joi'
import { isAuthenticated, isSuperAdmin } from '@middlewares/auth.middleware'
import validate from '@utils/validate-request'
import asyncHandler from '@utils/async-handler'
import paymentSettings from '@services/payment-settings.service'
import razorpay from '@services/razorpay.service'

const router = Router()
router.use(isAuthenticated, isSuperAdmin)
router.post(
  '/razorpay/test',
  asyncHandler(async (_, res) => res.success(await razorpay.testConnection()))
)
router.get(
  '/razorpay',
  asyncHandler(async (_, res) => res.success(await paymentSettings.read()))
)
router.put(
  '/razorpay',
  validate(
    Joi.object({
      key_id: Joi.string()
        .pattern(/^rzp_(test|live)_[a-zA-Z0-9]+$/)
        .required(),
      key_secret: Joi.string().trim().min(10).max(256).allow('').optional(),
      webhook_secret: Joi.string().min(10).max(256).allow('').optional(),
    })
  ),
  asyncHandler(async (req, res) =>
    res.success(await paymentSettings.save(req.body))
  )
)
export default router
