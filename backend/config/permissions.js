export const AUDIENCE = {
  tenant: 'tenant',
  platform: 'platform',
}

export const GROUPS = {
  dashboard: 'Dashboard',
  expense: 'Expense',
  sales: 'Sales',
  general: 'General',
  cashFlow: 'Cash Flow',
  overview: 'Overview',
  investors: 'Invest',
  configuration: 'Configuration',
  platform: 'Platform',
}

export const GROUP_ORDER = [
  GROUPS.dashboard,
  GROUPS.expense,
  GROUPS.sales,
  GROUPS.general,
  GROUPS.cashFlow,
  GROUPS.overview,
  GROUPS.investors,
  GROUPS.configuration,
  GROUPS.platform,
]

export const ACTION_LABELS = {
  read: 'View',
  write: 'Create',
  edit: 'Edit',
  delete: 'Delete',
}

export const ACTION_ORDER = ['read', 'write', 'edit', 'delete']

const actionFromKey = (key) => {
  const action = key.includes(':') ? key.split(':')[1] : key
  return {
    action,
    actionLabel: ACTION_LABELS[action] || action,
  }
}

const tenant = (key, description, group, submenu = null) => ({
  key,
  description,
  group,
  submenu,
  ...actionFromKey(key),
  audience: AUDIENCE.tenant,
})

const platform = (key, description, group, submenu = null) => ({
  key,
  description,
  group,
  submenu,
  ...actionFromKey(key),
  audience: AUDIENCE.platform,
})

export const PERMISSIONS = [
  tenant('dashboard:read', 'View farm dashboard', GROUPS.dashboard),

  tenant('purchase:read', 'View purchases', GROUPS.expense, 'Purchase'),
  tenant('purchase:write', 'Create purchases', GROUPS.expense, 'Purchase'),
  tenant('purchase:edit', 'Edit purchases', GROUPS.expense, 'Purchase'),
  tenant('purchase:delete', 'Delete purchases', GROUPS.expense, 'Purchase'),

  tenant('item_return:read', 'View item returns', GROUPS.expense, 'Returns'),
  tenant(
    'item_return:write',
    'Create item returns',
    GROUPS.expense,
    'Returns'
  ),
  tenant('item_return:edit', 'Edit item returns', GROUPS.expense, 'Returns'),
  tenant(
    'item_return:delete',
    'Delete item returns',
    GROUPS.expense,
    'Returns'
  ),

  tenant(
    'purchase_book:read',
    'View purchase book',
    GROUPS.expense,
    'Purchase Book'
  ),
  tenant(
    'purchase_book:write',
    'Add purchase book entries',
    GROUPS.expense,
    'Purchase Book'
  ),

  tenant(
    'integration_book:read',
    'View integration book',
    GROUPS.expense,
    'Integration Book'
  ),
  tenant(
    'integration_book:write',
    'Add integration book entries',
    GROUPS.expense,
    'Integration Book'
  ),

  tenant(
    'working_cost:read',
    'View working cost book',
    GROUPS.expense,
    'Working Cost Book'
  ),
  tenant(
    'working_cost:write',
    'Add working cost entries',
    GROUPS.expense,
    'Working Cost Book'
  ),

  tenant('sale:read', 'View sales', GROUPS.sales, 'Sale'),
  tenant('sale:write', 'Create sales', GROUPS.sales, 'Sale'),
  tenant('sale:edit', 'Edit sales', GROUPS.sales, 'Sale'),
  tenant('sale:delete', 'Delete sales', GROUPS.sales, 'Sale'),

  tenant('sales_book:read', 'View sales book', GROUPS.sales, 'Sales Book'),
  tenant(
    'sales_book:write',
    'Add sales book entries',
    GROUPS.sales,
    'Sales Book'
  ),

  tenant(
    'general_expense:read',
    'View general expenses',
    GROUPS.general,
    'General Expense'
  ),
  tenant(
    'general_expense:write',
    'Create general expenses',
    GROUPS.general,
    'General Expense'
  ),
  tenant(
    'general_expense:edit',
    'Edit general expenses',
    GROUPS.general,
    'General Expense'
  ),
  tenant(
    'general_expense:delete',
    'Delete general expenses',
    GROUPS.general,
    'General Expense'
  ),

  tenant(
    'general_sales:read',
    'View general sales',
    GROUPS.general,
    'General Sales'
  ),
  tenant(
    'general_sales:write',
    'Create general sales',
    GROUPS.general,
    'General Sales'
  ),
  tenant(
    'general_sales:edit',
    'Edit general sales',
    GROUPS.general,
    'General Sales'
  ),
  tenant(
    'general_sales:delete',
    'Delete general sales',
    GROUPS.general,
    'General Sales'
  ),

  tenant('cash_flow:read', 'View cash flow', GROUPS.cashFlow),

  tenant(
    'season_overview:read',
    'View season overview',
    GROUPS.overview,
    'Season Overview'
  ),
  tenant(
    'batch_overview:read',
    'View batch overview',
    GROUPS.overview,
    'Batch Overview'
  ),

  tenant('investor:read', 'View investors', GROUPS.investors, 'Management'),
  tenant('investor:write', 'Create investors', GROUPS.investors, 'Management'),
  tenant('investor:edit', 'Edit investors', GROUPS.investors, 'Management'),
  tenant(
    'investor:delete',
    'Deactivate investors',
    GROUPS.investors,
    'Management'
  ),

  tenant(
    'investor_ledger:read',
    'View investor ledger',
    GROUPS.investors,
    'Ledger'
  ),
  tenant(
    'investor_ledger:write',
    'Add investor ledger entries',
    GROUPS.investors,
    'Ledger'
  ),

  tenant('item:read', 'View items', GROUPS.configuration, 'Items'),
  tenant('item:write', 'Create items', GROUPS.configuration, 'Items'),
  tenant('item:edit', 'Edit items', GROUPS.configuration, 'Items'),
  tenant('item:delete', 'Delete items', GROUPS.configuration, 'Items'),

  tenant('farm:read', 'View farms', GROUPS.configuration, 'Farms'),
  tenant('farm:write', 'Create farms', GROUPS.configuration, 'Farms'),
  tenant('farm:edit', 'Edit farms', GROUPS.configuration, 'Farms'),
  tenant('farm:delete', 'Delete farms', GROUPS.configuration, 'Farms'),

  tenant('season:read', 'View seasons', GROUPS.configuration, 'Seasons'),
  tenant('season:write', 'Create seasons', GROUPS.configuration, 'Seasons'),
  tenant('season:edit', 'Edit seasons', GROUPS.configuration, 'Seasons'),
  tenant('season:delete', 'Delete seasons', GROUPS.configuration, 'Seasons'),

  tenant('batch:read', 'View batches', GROUPS.configuration, 'Batches'),
  tenant('batch:write', 'Create batches', GROUPS.configuration, 'Batches'),
  tenant('batch:edit', 'Edit batches', GROUPS.configuration, 'Batches'),
  tenant('batch:delete', 'Delete batches', GROUPS.configuration, 'Batches'),

  tenant('vendor:read', 'View vendors', GROUPS.configuration, 'Vendors'),
  tenant('vendor:write', 'Create vendors', GROUPS.configuration, 'Vendors'),
  tenant('vendor:edit', 'Edit vendors', GROUPS.configuration, 'Vendors'),
  tenant('vendor:delete', 'Delete vendors', GROUPS.configuration, 'Vendors'),

  tenant('user:read', 'View users', GROUPS.configuration, 'Users'),
  tenant('user:write', 'Create users', GROUPS.configuration, 'Users'),
  tenant('user:edit', 'Edit users', GROUPS.configuration, 'Users'),
  tenant('user:delete', 'Delete users', GROUPS.configuration, 'Users'),

  tenant('role:read', 'View roles', GROUPS.configuration, 'Roles'),
  tenant('role:write', 'Create roles', GROUPS.configuration, 'Roles'),
  tenant('role:edit', 'Edit roles', GROUPS.configuration, 'Roles'),
  tenant('role:delete', 'Delete roles', GROUPS.configuration, 'Roles'),

  tenant(
    'invoice:read',
    'View invoice numbers',
    GROUPS.configuration,
    'Invoice'
  ),

  platform(
    'subscriber:read',
    'View subscribers',
    GROUPS.platform,
    'Subscribers'
  ),
  platform(
    'subscriber:write',
    'Create subscribers',
    GROUPS.platform,
    'Subscribers'
  ),
  platform(
    'subscriber:edit',
    'Edit subscribers',
    GROUPS.platform,
    'Subscribers'
  ),
  platform(
    'subscriber:delete',
    'Disable subscribers',
    GROUPS.platform,
    'Subscribers'
  ),

  platform('package:read', 'View packages', GROUPS.platform, 'Packages'),
  platform('package:write', 'Create packages', GROUPS.platform, 'Packages'),
  platform('package:edit', 'Edit packages', GROUPS.platform, 'Packages'),
  platform('package:delete', 'Delete packages', GROUPS.platform, 'Packages'),

  platform(
    'subscription:read',
    'View subscriptions',
    GROUPS.platform,
    'Subscriptions'
  ),
  platform(
    'subscription:write',
    'Create subscriptions',
    GROUPS.platform,
    'Subscriptions'
  ),
  platform(
    'subscription:edit',
    'Edit subscriptions',
    GROUPS.platform,
    'Subscriptions'
  ),
  platform(
    'subscription:delete',
    'Delete subscriptions',
    GROUPS.platform,
    'Subscriptions'
  ),

  platform('referral:read', 'View referral partners', GROUPS.platform, 'Referrals'),
  platform(
    'referral:write',
    'Create referral partners',
    GROUPS.platform,
    'Referrals'
  ),
  platform(
    'referral:edit',
    'Edit referral partners',
    GROUPS.platform,
    'Referrals'
  ),
  platform(
    'referral:delete',
    'Disable referral partners',
    GROUPS.platform,
    'Referrals'
  ),
  platform(
    'referral_ledger:read',
    'View referral ledger',
    GROUPS.platform,
    'Referrals'
  ),
  platform(
    'referral_ledger:write',
    'Record referral payments',
    GROUPS.platform,
    'Referrals'
  ),
]

export const PERMISSION_KEYS = Object.fromEntries(
  PERMISSIONS.map((permission) => [
    permission.key.replace(':', '_'),
    permission.key,
  ])
)

export const tenantPermissionKeys = PERMISSIONS.filter(
  (permission) => permission.audience === AUDIENCE.tenant
).map((permission) => permission.key)

export const platformPermissionKeys = PERMISSIONS.filter(
  (permission) => permission.audience === AUDIENCE.platform
).map((permission) => permission.key)

const permissionByKey = new Map(
  PERMISSIONS.map((permission) => [permission.key, permission])
)

export const getPermissionMeta = (key) => permissionByKey.get(key) || null

export const isTenantPermission = (key) =>
  getPermissionMeta(key)?.audience === AUDIENCE.tenant

export const isPlatformPermission = (key) =>
  getPermissionMeta(key)?.audience === AUDIENCE.platform

export default PERMISSION_KEYS
