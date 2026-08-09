import Joi from 'joi'

export const newBrandSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
})
