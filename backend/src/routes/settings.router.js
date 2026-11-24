import { Router } from 'express'
import Joi from 'joi'
import { isAuthenticated, isSuperAdmin } from '@middlewares/auth.middleware'
import validate from '@utils/validate-request'
import asyncHandler from '@utils/async-handler'
import paymentSettings from '@services/payment-settings.service'
import razorpay from '@services/razorpay.service'
import platformSettings from '@services/platform-settings.service'
import emailSettings from '@services/email-settings.service'
import { sendMail } from '@services/mail.service'

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
router.get(
  '/subscriptions',
  asyncHandler(async (_, res) => res.success(await platformSettings.read()))
)
router.put(
  '/subscriptions',
  validate(
    Joi.object({
      subscription_reminder_days: Joi.number()
        .integer()
        .min(0)
        .max(365)
        .required(),
    })
  ),
  asyncHandler(async (req, res) =>
    res.success(await platformSettings.save(req.body))
  )
)
router.get(
  '/email',
  asyncHandler(async (_, res) => res.success(await emailSettings.read()))
)
router.put(
  '/email',
  validate(
    Joi.object({
      sender_email: Joi.string().trim().email().max(255).required(),
      sender_name: Joi.string().trim().max(100).allow('', null).optional(),
      password: Joi.string().max(256).allow('', null).optional(),
      smtp_host: Joi.string().trim().hostname().allow('', null).optional(),
      smtp_port: Joi.number()
        .integer()
        .min(1)
        .max(65535)
        .allow(null)
        .optional(),
      smtp_secure: Joi.boolean().optional(),
      frontend_url: Joi.string()
        .trim()
        .uri({ scheme: ['http', 'https'] })
        .required(),
    })
  ),
  asyncHandler(async (req, res) =>
    res.success(await emailSettings.save(req.body))
  )
)
router.post(
  '/email/test',
  validate(
    Joi.object({ to: Joi.string().trim().email().allow('', null).optional() })
  ),
  asyncHandler(async (req, res) => {
    const to = req.body.to || req.user.email
    if (!to) {
      const error = new Error('Enter an email address to send the test to.')
      error.statusCode = 400
      throw error
    }
    const config = await emailSettings.resolve()
    const result = await sendMail(to, 'Farmora test email', 'test-email', {
      sender: config.user || 'the configured address',
    })
    if (!result.success) {
      const error = new Error(`Test email failed: ${result.error}`)
      error.statusCode = 400
      error.code = 'EMAIL_TEST_FAILED'
      throw error
    }
    res.success({ to }, { message: `Test email sent to ${to}` })
  })
)
export default router
