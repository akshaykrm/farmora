import Joi from 'joi'

export const newPackageSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().positive().required(),
  duration: Joi.number().integer().positive().required(), // Duration in days
  status: Joi.string()
    .valid('active', 'inactive', 'disabled')
    .optional(),
})

export const updatePackageSchema = newPackageSchema.fork(
  Object.keys(newPackageSchema.describe().keys),
  (s) => s.optional()
)
