import Joi from 'joi'
import userRoles from '@utils/user-roles'
import { PermissionDeniedError } from '@errors/auth.errors'
import {
  ReportCompanyRequiredError,
  ReportFilterError,
  ReportNotFoundError,
  ReportTooLargeError,
} from '@errors/report.errors'
import { assertScoped, parseFilter } from './filters.js'
import { cacheKey, getCached, scopeFor, setCached } from './report-cache.js'
import { query } from './helpers.js'
import { getReport } from './registry.js'

export const EXPORT_LIMITS = { xlsx: 10000, pdf: 2000 }

export const PAGE_LIMIT = { default: 50, max: 200 }

const isAdmin = (user) => user.user_type === userRoles.admin.type

export const canUse = (user, definition, action) => {
  if (isAdmin(user)) return true
  if (definition.audience !== 'tenant') return false
  return (user.permissions || []).includes(definition.permissions[action])
}

const pagingSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(PAGE_LIMIT.max)
    .default(PAGE_LIMIT.default),
})

/**
 * Company reports run for the user's own company. Super admin has no company,
 * so they must pick one with `company_id`.
 */
export const resolveTenantCompany = async (user, rawQuery) => {
  if (!isAdmin(user)) return { masterId: user.master_id, company: null }

  const companyId = parseInt(rawQuery.company_id, 10)
  if (!companyId) throw new ReportCompanyRequiredError()
  const [company] = await query(
    `SELECT id, name FROM users WHERE id = :companyId AND user_type = 'manager'`,
    { companyId }
  )
  if (!company) throw new ReportFilterError('Company not found')
  return { masterId: company.id, company }
}

const resolveCompany = (definition, user, rawQuery) =>
  definition.audience === 'tenant'
    ? resolveTenantCompany(user, rawQuery)
    : { masterId: null, company: null }

const rowCount = (result) =>
  result.sections.reduce((sum, section) => sum + section.rows.length, 0)

/**
 * Builds a report for the screen (`mode: 'view'`) or for a file
 * (`mode: 'export'`). Results are cached per company, report and filters;
 * paged registers are cached per page on screen and never in export mode.
 */
export const runReport = async ({ key, user, rawQuery, mode, format }) => {
  const definition = getReport(key)
  if (!definition) throw new ReportNotFoundError(key)
  if (!canUse(user, definition, mode === 'export' ? 'export' : 'read')) {
    throw new PermissionDeniedError()
  }

  const { masterId, company } = await resolveCompany(definition, user, rawQuery)
  const filter = parseFilter(definition.schema, rawQuery)
  if (definition.scope) assertScoped(filter, definition.scope)

  const paging =
    definition.paged && mode === 'view'
      ? parseFilter(pagingSchema, rawQuery)
      : null
  const maxRows = mode === 'export' ? EXPORT_LIMITS[format] : null
  const cacheable = mode === 'view' || !definition.paged
  const key_ = cacheKey(scopeFor(masterId), key, filter, paging || {})

  let result = cacheable ? getCached(key_) : undefined
  if (!result) {
    result = await definition.build(filter, {
      masterId,
      mode,
      maxRows,
      page: paging?.page,
      limit: paging?.limit,
    })
    if (cacheable) setCached(key_, result)
  }

  if (maxRows) {
    const count = rowCount(result)
    if (count > maxRows) throw new ReportTooLargeError(count, maxRows)
  }

  const meta = company
    ? [{ label: 'Company', value: company.name }, ...(result.meta || [])]
    : result.meta || []

  return { definition, result: { ...result, meta } }
}
