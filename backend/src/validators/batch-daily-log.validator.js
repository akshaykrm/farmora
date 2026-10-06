import Joi from 'joi'

const isoDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ 'string.pattern.base': '{#label} must be a date (YYYY-MM-DD)' })

const quantity = Joi.number().min(0).precision(2)

export const dailyLogSchema = Joi.object({
  date: isoDate.required(),
  mortality: Joi.number().integer().min(0).default(0),
  issued_feed: quantity.default(0),
  consumed_feed: quantity.default(0),
  avg_body_weight: Joi.number().min(0).precision(3).allow(null).optional(),
  remarks: Joi.string().trim().max(500).allow('', null).optional(),
})

export const updateDailyLogSchema = Joi.object({
  date: isoDate.optional(),
  mortality: Joi.number().integer().min(0).optional(),
  issued_feed: quantity.optional(),
  consumed_feed: quantity.optional(),
  avg_body_weight: Joi.number().min(0).precision(3).allow(null).optional(),
  remarks: Joi.string().trim().max(500).allow('', null).optional(),
})

export const logStartDateSchema = Joi.object({
  log_start_date: isoDate.required(),
})

export const prefillQuerySchema = Joi.object({
  date: isoDate.required(),
})
