import batchFinancial from './builders/batch-financial.js'
import batchDailyLog from './builders/batch-daily-log.js'
import farmComparison from './builders/farm-comparison.js'
import dailyProduction from './builders/daily-production.js'
import salesRegister from './builders/sales-register.js'
import buyerSales from './builders/buyer-sales.js'
import purchaseRegister from './builders/purchase-register.js'
import supplierOutstanding from './builders/supplier-outstanding.js'
import profitLoss from './builders/profit-loss.js'
import expenseBreakdown from './builders/expense-breakdown.js'
import subscriptionRevenue from './builders/subscription-revenue.js'
import expiringSubscriptions from './builders/expiring-subscriptions.js'
import tenantUsage from './builders/tenant-usage.js'
import referralPayouts from './builders/referral-payouts.js'

const withPermissions = (definition) => ({
  ...definition,
  permissions: {
    read: `report_${definition.key}:read`,
    export: `report_${definition.key}:export`,
  },
})

const REPORTS = [
  batchFinancial,
  batchDailyLog,
  farmComparison,
  dailyProduction,
  salesRegister,
  buyerSales,
  purchaseRegister,
  supplierOutstanding,
  profitLoss,
  expenseBreakdown,
  subscriptionRevenue,
  expiringSubscriptions,
  tenantUsage,
  referralPayouts,
].map(withPermissions)

const byKey = new Map(REPORTS.map((definition) => [definition.key, definition]))

export const getReport = (key) => byKey.get(key) || null

export const listReports = () => REPORTS
