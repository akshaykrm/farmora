'use strict'

const TENANT_REPORTS = [
  'batch_financial',
  'batch_daily_log',
  'farm_comparison',
  'daily_production',
  'sales_register',
  'buyer_sales',
  'purchase_register',
  'supplier_outstanding',
  'profit_loss',
  'expense_breakdown',
]

const PLATFORM_REPORTS = [
  'subscription_revenue',
  'expiring_subscriptions',
  'tenant_usage',
  'referral_payouts',
]

const keysFor = (reports) =>
  reports.flatMap((name) => [`report_${name}:read`, `report_${name}:export`])

const tenantKeys = keysFor(TENANT_REPORTS)
const keys = [...tenantKeys, ...keysFor(PLATFORM_REPORTS)]

const describe = (key) => {
  const [name, action] = key.replace(/^report_/, '').split(':')
  const title = name.replace(/_/g, ' ')
  return `${action === 'read' ? 'View' : 'Export'} ${title} report`
}

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const now = new Date()

    for (const key of keys) {
      await queryInterface.sequelize.query(
        `
          INSERT INTO permissions ("key", description, created_at, updated_at)
          VALUES (:key, :description, :now, :now)
          ON CONFLICT ("key") DO NOTHING
        `,
        { replacements: { key, description: describe(key), now } }
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
        { replacements: { keys } }
      )
    }
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE key IN (:keys)`,
      { replacements: { keys } }
    )
  },
}
