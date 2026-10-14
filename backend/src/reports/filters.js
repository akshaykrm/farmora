import Joi from 'joi'
import dayjs from 'dayjs'
import { ReportFilterError } from '@errors/report.errors'

export const isoDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ 'string.pattern.base': '{#label} must be a date (YYYY-MM-DD)' })

const id = Joi.number().integer().positive()

export const fields = {
  start_date: isoDate,
  end_date: isoDate,
  season_id: id,
  batch_id: id,
  farm_id: id,
  buyer_id: id,
  vendor_id: id,
  as_of: isoDate,
  payment_type: Joi.string().valid('credit', 'cash', 'paid'),
  include_open: Joi.boolean().truthy('true', '1').falsy('false', '0'),
  days: Joi.number().integer().valid(7, 15, 30),
  batch_status: Joi.string().valid('open', 'closed'),
}

export const schemaOf = (...names) =>
  Joi.object(Object.fromEntries(names.map((name) => [name, fields[name]])))

export const DEFAULT_MAX_DAYS = 366

/**
 * Every company report needs a season, a batch or a bounded date range so a
 * single request can never scan a company's whole history.
 */
export const assertScoped = (
  filter,
  { maxDays = DEFAULT_MAX_DAYS, scopes = ['season_id', 'batch_id'] } = {}
) => {
  const { start_date: start, end_date: end } = filter
  if (start && end) {
    if (end < start) {
      throw new ReportFilterError('End date cannot be before the start date')
    }
    const days = dayjs(end).diff(dayjs(start), 'day') + 1
    if (days > maxDays) {
      throw new ReportFilterError(
        `The date range can be at most ${maxDays} days`
      )
    }
    return
  }

  if (scopes.some((key) => filter[key])) return

  const options = [
    ...scopes.map((key) => key.replace('_id', '')),
    `a date range of up to ${maxDays} days`,
  ]
  throw new ReportFilterError(`Select ${options.join(', or ')}`)
}

/** Validates and normalises the report filter, dropping unknown keys. */
export const parseFilter = (schema, query) => {
  const { value, error } = schema.validate(query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  })
  if (error) {
    throw new ReportFilterError(error.details.map((d) => d.message).join(', '))
  }
  return value
}
