import Joi from 'joi'

export const newGeneralCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  status: Joi.string().valid('active', 'inactive').optional(),
})
