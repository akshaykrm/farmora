import Joi from 'joi'

export const newManageSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(3).max(100).required(),
  status: Joi.number().integer().required(),
  package_id: Joi.number().integer().optional(),
})

export const newStaffMemberSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(3).max(100).required(),
})

export const updateNewStaffSchema = newStaffMemberSchema
  .keys({
    password: Joi.forbidden(),
  })
  .fork(['name', 'username'], (schema) => schema.optional())

export const resetPasswordSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  new_password: Joi.string().min(3).max(100).required(),
})
