'use strict'

const TENANT_EXPORT_PERMISSIONS = [
  { key: 'sale:export', description: 'Export sales' },
  { key: 'sales_book:export', description: 'Export sales book' },
  { key: 'general_expense:export', description: 'Export general expenses' },
  { key: 'general_sales:export', description: 'Export general sales' },
  { key: 'cash_flow:export', description: 'Export cash flow' },
  { key: 'season_overview:export', description: 'Export season overview' },
  { key: 'batch_overview:export', description: 'Export batch overview' },
  { key: 'investor:export', description: 'Export investors' },
  { key: 'investor_ledger:export', description: 'Export investor ledger' },
  { key: 'item:export', description: 'Export items' },
  { key: 'farm:export', description: 'Export farms' },
  { key: 'season:export', description: 'Export seasons' },
  { key: 'batch:export', description: 'Export batches' },
  { key: 'vendor:export', description: 'Export vendors' },
  { key: 'user:export', description: 'Export users' },
]

const PLATFORM_EXPORT_PERMISSIONS = [
  { key: 'subscriber:export', description: 'Export subscribers' },
  { key: 'package:export', description: 'Export packages' },
  { key: 'referral:export', description: 'Export referral partners' },
  { key: 'referral_ledger:export', description: 'Export referral ledger' },
]

const ALL_PERMISSIONS = [
  ...TENANT_EXPORT_PERMISSIONS,
  ...PLATFORM_EXPORT_PERMISSIONS,
]
const allKeys = ALL_PERMISSIONS.map((permission) => permission.key)
const tenantKeys = TENANT_EXPORT_PERMISSIONS.map((permission) => permission.key)

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const now = new Date()

    for (const permission of ALL_PERMISSIONS) {
      await queryInterface.sequelize.query(
        `
          INSERT INTO permissions ("key", description, created_at, updated_at)
          VALUES (:key, :description, :now, :now)
          ON CONFLICT ("key") DO NOTHING
        `,
        { replacements: { ...permission, now } }
      )
    }

    await queryInterface.sequelize.query(
      `
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT r.id, p.id, :now, :now
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.kind = 'system'
          AND p.key IN (:keys)
          AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp
            WHERE rp.role_id = r.id AND rp.permission_id = p.id
          )
      `,
      { replacements: { keys: tenantKeys, now } }
    )
  },

  async down(queryInterface) {
    for (const table of ['role_permissions', 'user_permissions']) {
      await queryInterface.sequelize.query(
        `
          DELETE FROM ${table}
          WHERE permission_id IN (SELECT id FROM permissions WHERE key IN (:keys))
        `,
        { replacements: { keys: allKeys } }
      )
    }
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE key IN (:keys)`,
      { replacements: { keys: allKeys } }
    )
  },
}
