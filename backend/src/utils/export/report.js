import dayjs from 'dayjs'

/**
 * @typedef {'text' | 'date' | 'currency' | 'number'} ColumnType
 *
 * @typedef {Object} ReportColumn
 * @property {string} key
 * @property {string} header
 * @property {ColumnType} [type]
 * @property {number} [width] Relative width weight, used by both renderers
 *
 * @typedef {Object} ReportSection
 * @property {string} title
 * @property {ReportColumn[]} columns
 * @property {Object[]} rows
 *
 * @typedef {Object} ReportEntry
 * @property {string} label
 * @property {string | number | null} value
 * @property {ColumnType} [type]
 *
 * @typedef {Object} Report
 * @property {string} title
 * @property {string} filename Base name, without date or extension
 * @property {ReportEntry[]} meta Applied filters shown above the data
 * @property {ReportSection[]} sections
 * @property {ReportEntry[]} [summary]
 */

export const EXPORT_FORMATS = {
  xlsx: {
    extension: 'xlsx',
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  pdf: {
    extension: 'pdf',
    contentType: 'application/pdf',
  },
}

export const DATE_FORMAT = 'DD-MM-YYYY'

export const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const toDate = (value) => {
  if (!value) return null
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.toDate() : null
}

const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatValue = (value, type = 'text') => {
  if (value === null || value === undefined || value === '') return ''
  switch (type) {
    case 'date': {
      const date = toDate(value)
      return date ? dayjs(date).format(DATE_FORMAT) : ''
    }
    case 'currency': {
      const number = toNumber(value)
      return number === null ? '' : numberFormatter.format(number)
    }
    case 'number': {
      const number = toNumber(value)
      return number === null ? '' : String(number)
    }
    default:
      return String(value)
  }
}

export const dateRangeLabel = (start, end) => {
  if (!start && !end) return null
  const from = start ? formatValue(start, 'date') : 'Beginning'
  const to = end ? formatValue(end, 'date') : 'Today'
  return `${from} to ${to}`
}

export const compactMeta = (entries) =>
  entries.filter(
    (entry) =>
      entry &&
      entry.value !== null &&
      entry.value !== undefined &&
      entry.value !== ''
  )
