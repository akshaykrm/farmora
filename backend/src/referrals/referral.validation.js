import Joi from 'joi'

const bonusFields = {
  referral_bonus_type: Joi.string()
    .valid('none', 'fixed', 'percentage')
    .optional(),
  referral_bonus_value: Joi.number().min(0).allow(null).optional(),
}

export const createReferralPartnerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(7).max(20).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  code: Joi.string().min(3).max(50).required(),
  status: Joi.string().valid('active', 'inactive').optional(),
  ...bonusFields,
}).custom((value, helpers) => {
  const type = value.referral_bonus_type || 'none'
  if (type !== 'none' && !(Number(value.referral_bonus_value) > 0)) {
    return helpers.message(
      'referral_bonus_value is required when bonus type is fixed or percentage'
    )
  }
  return value
})

export const updateReferralPartnerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().min(7).max(20).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  code: Joi.string().min(3).max(50).optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  ...bonusFields,
}).custom((value, helpers) => {
  if (
    value.referral_bonus_type &&
    value.referral_bonus_type !== 'none' &&
    value.referral_bonus_value !== undefined &&
    !(Number(value.referral_bonus_value) > 0)
  ) {
    return helpers.message(
      'referral_bonus_value is required when bonus type is fixed or percentage'
    )
  }
  return value
})

export const referralPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  remarks: Joi.string().max(500).allow('', null).optional(),
})

export const linkCompanySchema = Joi.object({
  user_id: Joi.number().integer().required(),
})
