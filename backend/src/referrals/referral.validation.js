import Joi from 'joi'

export const createReferralPartnerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(7).max(20).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  code: Joi.string().min(3).max(50).required(),
  status: Joi.string().valid('active', 'inactive').optional(),
})

export const updateReferralPartnerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().min(7).max(20).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  code: Joi.string().min(3).max(50).optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
})

export const referralPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  remarks: Joi.string().max(500).allow('', null).optional(),
})

export const linkCompanySchema = Joi.object({
  user_id: Joi.number().integer().required(),
})
