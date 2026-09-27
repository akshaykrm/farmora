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
  referral_code: Joi.string().min(3).max(50).allow('', null).optional(),
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
  role_ids: Joi.array().items(Joi.number().integer()).optional(),
  permission_ids: Joi.array().items(Joi.number().integer()).optional(),
  parent_id: Joi.number().integer().optional(),
  status: Joi.number().integer().optional(),
})

export const updateNewStaffSchema = newStaffMemberSchema
  .keys({
    password: Joi.forbidden(),
    email: Joi.string().email().optional(),
    phone: Joi.string().min(7).max(20).optional(),
    state: optionalProfileField,
    district: optionalProfileField,
    place: optionalProfileField,
    pincode: optionalProfileField,
    bird_capacity: optionalProfileField,
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

export const setUserPasswordSchema = Joi.object({
  new_password: Joi.string().min(3).max(100).required(),
})
