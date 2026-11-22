import Joi from 'joi'

export const newGeneralExpenseSchema = Joi.object({
  season_id: Joi.number().required(),
  category_id: Joi.number().integer().optional(),
  purpose: Joi.string().optional(),
  amount: Joi.number().required(),
  date: Joi.string().required(),
  narration: Joi.string().optional().allow('', null),
}).or('category_id', 'purpose')

export const updateGeneralExpenseSchema = newGeneralExpenseSchema.fork(
  Object.keys(newGeneralExpenseSchema.describe().keys),
  (s) => s.optional()
)
