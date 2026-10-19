import Joi from 'joi'

export const setupItemsSchema = Joi.object({
  system: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid('integration', 'working', 'general')
          .required(),
        name: Joi.string().trim().min(3).max(100).required(),
        base_price: Joi.number().min(0).required(),
      })
    )
    .unique('type')
    .default([]),
  extra: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(3).max(100).required(),
        type: Joi.string()
          .valid(
            'regular',
            'chick',
            'medicine',
            'PRE STARTER',
            'STARTER',
            'FINISHER'
          )
          .required(),
        base_price: Joi.number().min(0).required(),
        vendor_id: Joi.number().integer().required(),
      })
    )
    .default([]),
})
