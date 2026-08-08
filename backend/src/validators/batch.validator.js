import Joi from 'joi'

export const newBatchSchema = Joi.object({
  farm_id: Joi.number().integer().required(),
  season_id: Joi.number().integer().required(),
  name: Joi.string().min(3).max(100).required(),
  status: Joi.string().valid('active', 'inactive').required(),
})

export const updateBatchSchema = newBatchSchema.fork(
  Object.keys(newBatchSchema.describe().keys),
  (s) => s.optional()
)

export const addBatchLogSchema = Joi.object({
  log: Joi.string().trim().min(1).max(500).required(),
})
