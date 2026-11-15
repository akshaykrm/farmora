import Joi from 'joi'

export const newSaleSchema = Joi.object({
  season_id: Joi.number().integer().required(),
  batch_id: Joi.number().integer().required(),
  date: Joi.date().required(),
  buyer_id: Joi.number().integer().required(),
  vehicle_no: Joi.string().max(50).optional().allow('', null),
  weight: Joi.number().positive().required(),
  bird_no: Joi.number().integer().positive().required(),
  payment_type: Joi.string().valid('credit', 'cash').required(),
  price: Joi.number().greater(-1).optional(),
  narration: Joi.string().max(500).optional().allow('', null),
  status: Joi.string().valid('active', 'inactive').optional(),
  is_incomplete: Joi.boolean().optional(),
})

export const updateSaleSchema = newSaleSchema.fork(
  Object.keys(newSaleSchema.describe().keys),
  (s) => s.optional()
)

export const addSalesBookEntrySchema = Joi.object({
  date: Joi.date().required(),
  buyer_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  narration: Joi.string().max(500).optional().allow('', null),
})
