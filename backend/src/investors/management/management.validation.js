import Joi from 'joi'

export const createInvestorManagementValidation = Joi.object({
  investor_name: Joi.string().min(1).max(200).required().messages({
    'any.required': 'Investor name is required',
    'string.empty': 'Investor name is required',
  }),
  investor_phone: Joi.string().min(5).max(20).required().messages({
    'any.required': 'Investor phone is required',
    'string.empty': 'Investor phone is required',
  }),
  investor_email: Joi.string().email().allow('', null).messages({
    'string.email': 'Please provide a valid email address',
  }),
  is_active: Joi.boolean().default(true),
})

export const updateInvestorManagementValidation =
  createInvestorManagementValidation.fork(
    Object.keys(createInvestorManagementValidation.describe().keys),
    (s) => s.optional()
  )
