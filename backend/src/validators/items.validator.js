import Joi from 'joi'

export const newItemCategory = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  base_price: Joi.number().required(),
  vendor_id: Joi.number().required(),
  type: Joi.string()
    .valid(
      'chick',
      'medicine',
      'FINISHER',
      'STARTER',
      'PRE STARTER',
      'integration',
      'working',
      'regular'
    )
    .required(),
})

export const updateItemsCategory = newItemCategory.fork(
  Object.keys(newItemCategory.describe().keys),
  (s) => s.optional()
)

export const newItemSchema = Joi.object({
  total_price: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
  vendor_id: Joi.number().required(),
  season_id: Joi.number().required(),
  discount_price: Joi.number()
    .max(Joi.ref('total_price'))
    .empty('')
    .default(0)
    .optional(),
  price_per_unit: Joi.number().required(),
  category_id: Joi.number().required(),
  batch_id: Joi.number().optional(),
  assign_quantity: Joi.number()
    .max(Joi.ref('quantity'))
    .empty('')
    .default(0)
    .optional(),
  net_amount: Joi.number().required(),
  invoice_number: Joi.string().required(),
  invoice_date: Joi.date().required(),
  payment_type: Joi.string().valid('credit', 'paid').required(),
})

export const assignItemToBatchSchema = Joi.object({
  batch_id: Joi.number().required(),
  item_id: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
})

export const reassignItemToBatchSchema = Joi.object({
  source_batch_id: Joi.number().required(),
  target_batch_id: Joi.number().required(),
  item_id: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
})

export const updateItemsSchema = newItemSchema.fork(
  Object.keys(newItemSchema.describe().keys),
  (s) => s.optional()
)

export const purchaseBookSchema = Joi.object({
  vendor_id: Joi.number().required(),
  amount: Joi.number().required(),
  date: Joi.date().required(),
})
