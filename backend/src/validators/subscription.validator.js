import Joi from 'joi'

export const createSubscriptionSchema = Joi.object({
  package_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().optional(),
})

export const renewSubscriptionSchema = Joi.object({
  package_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().optional(),
  referral_partner_id: Joi.number().integer().allow(null).optional(),
})

export const updateSubscriptionSchema = Joi.object({
  package_id: Joi.number().integer().optional(),
  valid_from: Joi.date().optional(),
  valid_to: Joi.date().optional(),
  referral_partner_id: Joi.number().integer().allow(null).optional(),
})
