import { dateRangeLabel } from '@utils/export/report'

export const capitalize = (value) =>
  value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : ''

/**
 * Resolves a filter id to a readable name for report meta. Lookups that fail
 * (deleted or foreign records) fall back to the raw id instead of failing the export.
 */
export const nameOf = async (lookup, id, currentUser) => {
  if (!id) return null
  try {
    const record = await lookup(id, currentUser)
    return record?.name || record?.investor_name || record?.type || `#${id}`
  } catch {
    return `#${id}`
  }
}

export const dateMeta = (start, end, label = 'Date Range') => ({
  label,
  value: dateRangeLabel(start, end),
})

export const sumOf = (rows, key) =>
  rows.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0)

export const toPlain = (record) =>
  record && typeof record.toJSON === 'function' ? record.toJSON() : record

export const statusLabel = (status) => {
  if (status === 1 || status === true) return 'Active'
  if (status === 0 || status === false) return 'Inactive'
  return capitalize(status)
}
