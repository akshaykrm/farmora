import Joi from 'joi'

const optionalProfileField = Joi.string().max(100).allow('').optional()

export const newManageSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  username: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).max(20).required(),
  password: Joi.string().min(3).max(100).required(),
  status: Joi.number().integer().required(),
  package_id: Joi.number().integer().optional(),
  state: optionalProfileField,
  district: optionalProfileField,
  place: optionalProfileField,
  pincode: optionalProfileField,
  bird_capacity: optionalProfileField,
})

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  email: Joi.string().email(),
  phone: Joi.string().min(7).max(20),
  state: optionalProfileField,
  district: optionalProfileField,
  place: optionalProfileField,
  pincode: optionalProfileField,
  bird_capacity: optionalProfileField,
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

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().min(3).max(100).required(),
  new_password: Joi.string().min(3).max(100).required(),
})
