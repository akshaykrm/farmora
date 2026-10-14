import dayjs from 'dayjs'
import { QueryTypes } from 'sequelize'
import { sequelize } from '@utils/db'
import { ReportTooLargeError } from '@errors/report.errors'

export const query = (sql, replacements = {}) =>
  sequelize.query(sql, { replacements, type: QueryTypes.SELECT })

export const num = (value) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const round = (value, digits = 2) => {
  const factor = 10 ** digits
  return Math.round(num(value) * factor) / factor
}

export const ratio = (top, bottom, digits = 2) =>
  num(bottom) ? round(num(top) / num(bottom), digits) : 0

export const pct = (part, whole) => ratio(num(part) * 100, whole)

export const dayStart = (date) => dayjs(date).startOf('day').toDate()

export const nextDayStart = (date) =>
  dayjs(date).add(1, 'day').startOf('day').toDate()

/**
 * SQL fragment and replacements for an optional date range on `column`.
 * End dates are inclusive of the whole day.
 */
export const dateRangeSql = (column, filter, prefix = 'range') => {
  const parts = []
  const replacements = {}
  if (filter.start_date) {
    parts.push(`${column} >= :${prefix}_start`)
    replacements[`${prefix}_start`] = dayStart(filter.start_date)
  }
  if (filter.end_date) {
    parts.push(`${column} < :${prefix}_end`)
    replacements[`${prefix}_end`] = nextDayStart(filter.end_date)
  }
  return {
    sql: parts.length ? ` AND ${parts.join(' AND ')}` : '',
    replacements,
  }
}

/** Optional `column = :name` fragments for the ids present in the filter. */
export const idFiltersSql = (pairs) => {
  const parts = []
  const replacements = {}
  for (const [column, name, value] of pairs) {
    if (value === undefined || value === null || value === '') continue
    parts.push(`${column} = :${name}`)
    replacements[name] = value
  }
  return {
    sql: parts.length ? ` AND ${parts.join(' AND ')}` : '',
    replacements,
  }
}

export const nameOf = async (table, id, masterId) => {
  if (!id) return null
  const rows = await query(
    `SELECT name FROM ${table} WHERE id = :id${masterId ? ' AND master_id = :masterId' : ''} LIMIT 1`,
    { id, masterId }
  )
  return rows[0]?.name || `#${id}`
}

export const sumRows = (rows, keys) =>
  Object.fromEntries(
    keys.map((key) => [
      key,
      round(rows.reduce((sum, row) => sum + num(row[key]), 0)),
    ])
  )

/**
 * Runs a register query a page at a time on screen. In export mode it fetches
 * every row, after checking the row count against the export limit.
 */
export const pagedQuery = async ({ sql, replacements, count, ctx }) => {
  if (ctx.mode === 'export') {
    if (count > ctx.maxRows) throw new ReportTooLargeError(count, ctx.maxRows)
    return { rows: await query(sql, replacements), pagination: null }
  }
  const { page, limit } = ctx
  const rows = await query(`${sql} LIMIT :pageLimit OFFSET :pageOffset`, {
    ...replacements,
    pageLimit: limit,
    pageOffset: (page - 1) * limit,
  })
  return {
    rows,
    pagination: { page, limit, count, totalPages: Math.ceil(count / limit) },
  }
}

export const isoDate = (value) =>
  value ? dayjs(value).format('YYYY-MM-DD') : null
