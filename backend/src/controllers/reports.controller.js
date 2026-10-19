import asyncHandler from '@utils/async-handler'
import userRoles from '@utils/user-roles'
import sendExport from '@utils/export/send-export'
import { query } from '../reports/helpers.js'
import { listReports } from '../reports/registry.js'
import { PermissionDeniedError } from '@errors/auth.errors'
import { canUse, resolveTenantCompany, runReport } from '../reports/runner.js'
import { withExportLock } from '../reports/export-lock.js'
import { toExportReport } from '../reports/to-export.js'

const describe = (definition, user) => ({
  key: definition.key,
  title: definition.title,
  description: definition.description,
  group: definition.group,
  audience: definition.audience,
  paged: Boolean(definition.paged),
  can_export: canUse(user, definition, 'export'),
})

const list = async (req, res) => {
  const reports = listReports()
    .filter((definition) => canUse(req.user, definition, 'read'))
    .map((definition) => describe(definition, req.user))
  res.success(reports, { message: 'Reports fetched successfully' })
}

const companies = async (req, res) => {
  const rows = await query(
    `SELECT id, name FROM users WHERE user_type = :type ORDER BY name ASC`,
    { type: userRoles.manager.type }
  )
  res.success(rows, { message: 'Companies fetched successfully' })
}

/**
 * Names for the report filter dropdowns, for the company the reports run
 * against (super admin passes `company_id`).
 */
const options = async (req, res) => {
  const canReadAny = listReports().some(
    (definition) =>
      definition.audience === 'tenant' && canUse(req.user, definition, 'read')
  )
  if (!canReadAny) throw new PermissionDeniedError()

  const { masterId } = await resolveTenantCompany(req.user, req.query)
  const replacements = { masterId }
  const [seasons, farms, batches, vendors] = await Promise.all([
    query(
      `SELECT id, name FROM seasons
       WHERE master_id = :masterId AND deleted_at IS NULL ORDER BY id DESC`,
      replacements
    ),
    query(
      `SELECT id, name FROM farms WHERE master_id = :masterId ORDER BY name ASC`,
      replacements
    ),
    query(
      `SELECT id, name, season_id, farm_id, (closed_on IS NOT NULL) AS closed
       FROM batches WHERE master_id = :masterId ORDER BY id DESC`,
      replacements
    ),
    query(
      `SELECT id, name, vendor_type FROM vendors
       WHERE master_id = :masterId ORDER BY name ASC`,
      replacements
    ),
  ])
  const pick = (type) =>
    vendors
      .filter((vendor) => vendor.vendor_type === type)
      .map(({ id, name }) => ({ id, name }))

  res.success(
    {
      seasons,
      farms,
      batches,
      buyers: pick('customer'),
      suppliers: pick('supplier'),
    },
    { message: 'Report options fetched successfully' }
  )
}

const view = async (req, res) => {
  const { definition, result } = await runReport({
    key: req.params.key,
    user: req.user,
    rawQuery: req.query,
    mode: 'view',
  })
  res.success(
    { report: describe(definition, req.user), ...result },
    { message: 'Report generated successfully' }
  )
}

const exportReport = async (req, res) => {
  const format = req.query.format
  await withExportLock(req.user.id, async () => {
    const { definition, result } = await runReport({
      key: req.params.key,
      user: req.user,
      rawQuery: req.query,
      mode: 'export',
      format,
    })
    await sendExport(res, format, toExportReport(definition, result))
  })
}

const reportsController = {
  list: asyncHandler(list),
  companies: asyncHandler(companies),
  options: asyncHandler(options),
  view: asyncHandler(view),
  export: asyncHandler(exportReport),
}

export default reportsController
