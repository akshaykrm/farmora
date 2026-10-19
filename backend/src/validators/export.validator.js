import Joi from 'joi'
import { EXPORT_FORMATS } from '@utils/export/report'

export const exportQuerySchema = Joi.object({
  format: Joi.string()
    .valid(...Object.keys(EXPORT_FORMATS))
    .required(),
}).unknown(true)

export const purchaseBookExportQuerySchema = exportQuerySchema.keys({
  vendor_id: Joi.number().integer().required(),
})

export const integrationBookExportQuerySchema = exportQuerySchema.keys({
  farm_id: Joi.number().integer().required(),
})

export const workingCostExportQuerySchema = exportQuerySchema.keys({
  season_id: Joi.number().integer().required(),
})

export const salesBookExportQuerySchema = exportQuerySchema.keys({
  buyer_id: Joi.number().integer().required(),
})

export const seasonOverviewExportQuerySchema = exportQuerySchema.keys({
  season_id: Joi.number().integer().required(),
})

export const batchOverviewExportQuerySchema = exportQuerySchema.keys({
  batch_id: Joi.number().integer().required(),
})
