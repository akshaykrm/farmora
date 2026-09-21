import Joi from 'joi'

export const newPackageSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow('').optional(),
  actual_price: Joi.number().min(0).required(),
  discount_price: Joi.number()
    .min(0)
    .max(Joi.ref('actual_price'))
    .required(),
  duration: Joi.number().integer().positive().required(),
  status: Joi.string()
    .valid('active', 'inactive', 'disabled')
    .optional(),
  referral_bonus_type: Joi.string()
    .valid('none', 'fixed', 'percentage')
    .optional(),
  referral_bonus_value: Joi.number().min(0).allow(null).optional(),
})

export const updatePackageSchema = newPackageSchema.fork(
  Object.keys(newPackageSchema.describe().keys),
  (s) => s.optional()
)
