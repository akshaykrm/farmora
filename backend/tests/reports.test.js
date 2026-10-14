import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import { EventEmitter } from 'events'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import RoleModel from '@models/role'
import RolePermissionModel from '@models/rolepermission'
import UserRoleAssignment from '@models/userroleassignment'
import VendorModel from '@models/vendor'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import BatchModel from '@models/batch'
import BatchDailyLogModel from '@models/batchdailylog'
import BatchReportSnapshotModel from '@models/batchreportsnapshot'
import PurchaseModel from '@models/purchase'
import PurchaseReturnModel from '@models/purchase-return'
import PurchaseBook from '@models/purchasebook'
import SalesModel from '@models/sales'
import GeneralExpenseModel from '@models/generalexpense'
import ExpenseSalesModel from '@models/expensesales'
import ItemModel from '@models/items.model'
import overviewService from '@services/overview.service'
import purchaseService from '@services/purchase.service'
import { connectDB } from '@utils/db'
import { EXPORT_LIMITS } from '../src/reports/runner.js'
import { withExportLock } from '../src/reports/export-lock.js'
import { reportCacheInvalidator } from '../src/reports/report-cache.js'
import { createSystemRoleWithKeys } from './helpers/entitlements.js'

const unique = (prefix) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

const REPORT_KEYS = [
  'batch_daily_log:read',
  'report_batch_financial:read',
  'report_batch_financial:export',
  'report_batch_daily_log:read',
  'report_farm_comparison:read',
  'report_daily_production:read',
  'report_sales_register:read',
  'report_sales_register:export',
  'report_buyer_sales:read',
  'report_purchase_register:read',
  'report_supplier_outstanding:read',
  'report_profit_loss:read',
  'report_expense_breakdown:read',
]

const PAGES = {
  e_page: 1,
  e_limit: 10,
  s_page: 1,
  s_limit: 10,
  r_page: 1,
  r_limit: 10,
}

const loginAs = async (username, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
  expect(res.status).toBe(200)
  return res.body.data.token
}

const createUser = async (fields) => {
  const username = unique('reportuser')
  const user = await UserModel.create({
    name: 'Report User',
    username,
    email: `${username}@farmora.test`,
    phone: '9999999999',
    password: 'root',
    status: 1,
    parent_id: 1,
    ...fields,
  })
  return user
}

const createManager = async (pkg) => {
  const manager = await createUser({ user_type: 'manager' })
  await SubscriptionModel.create({
    user_id: manager.id,
    package_id: pkg.id,
    valid_from: dayjs().subtract(1, 'day').toDate(),
    valid_to: dayjs().add(1, 'year').toDate(),
  })
  return { manager, token: await loginAs(manager.username, 'root') }
}

/**
 * One closed batch: 1000 chicks, 20 feed bags (2 returned to the supplier),
 * 900 birds / 1800 kg sold, a general cost and a general income.
 */
const seedCompany = async (masterId) => {
  const farm = await FarmModel.create({
    master_id: masterId,
    name: 'Report Farm',
    place: 'Test',
    capacity: 2000,
  })
  const season = await SeasonModel.create({
    master_id: masterId,
    name: 'Report Season',
    status: 'active',
    from_date: '2025-01-01',
    to_date: '2025-12-31',
  })
  const batch = await BatchModel.create({
    master_id: masterId,
    farm_id: farm.id,
    season_id: season.id,
    name: 'Report Batch',
    status: 'active',
  })
  const supplier = await VendorModel.create({
    master_id: masterId,
    name: 'Report Supplier',
    vendor_type: 'supplier',
    address: 'Test',
    opening_balance: 1000,
  })
  const buyer = await VendorModel.create({
    master_id: masterId,
    name: 'Report Buyer',
    vendor_type: 'customer',
    address: 'Test',
    opening_balance: 0,
  })
  const chick = await ItemModel.create({
    master_id: masterId,
    name: 'Report Chick',
    type: 'chick',
    vendor_id: supplier.id,
  })
  const feed = await ItemModel.create({
    master_id: masterId,
    name: 'Report Starter',
    type: 'STARTER',
    vendor_id: supplier.id,
  })
  const purchase = (item, quantity, total, net, date) =>
    PurchaseModel.create({
      master_id: masterId,
      name: item.name,
      category_id: item.id,
      quantity,
      total_price: total,
      net_amount: net,
      price_per_unit: total / quantity,
      invoice_number: unique('inv'),
      invoice_date: dayjs(date).toDate(),
      vendor_id: supplier.id,
      season_id: season.id,
      farm_id: farm.id,
      batch_id: batch.id,
      payment_type: 'credit',
    })
  await purchase(chick, 1000, 30000, 30000, '2025-09-01')
  await purchase(feed, 20, 40000, 38000, '2025-09-02')
  await PurchaseReturnModel.create({
    return_type: 'vendor',
    item_category_id: feed.id,
    date: dayjs('2025-09-20').toDate(),
    from_batch: batch.id,
    to_vendor: supplier.id,
    quantity: 2,
    rate_per_bag: 2000,
    total_amount: 4000,
    master_id: masterId,
    payment_type: 'paid',
  })
  await PurchaseBook.create({
    master_id: masterId,
    vendor_id: supplier.id,
    amount: 10000,
    date: dayjs('2025-09-25').toDate(),
  })
  await SalesModel.create({
    master_id: masterId,
    season_id: season.id,
    batch_id: batch.id,
    date: dayjs('2025-09-30').toDate(),
    buyer_id: buyer.id,
    weight: 1800,
    bird_no: 900,
    avg_weight: 2,
    price: 100,
    amount: 180000,
    payment_type: 'credit',
  })
  await BatchDailyLogModel.bulkCreate([
    {
      master_id: masterId,
      batch_id: batch.id,
      date: '2025-09-01',
      mortality: 10,
      issued_feed: 20,
      consumed_feed: 8,
    },
    {
      master_id: masterId,
      batch_id: batch.id,
      date: '2025-09-30',
      mortality: 5,
      consumed_feed: 10,
      sold_birds: 900,
      sold_weight: 1800,
    },
  ])
  await GeneralExpenseModel.create({
    master_id: masterId,
    season_id: season.id,
    purpose: 'Electricity',
    date: dayjs('2025-09-15').toDate(),
    amount: 5000,
  })
  await ExpenseSalesModel.create({
    master_id: masterId,
    season_id: season.id,
    purpose: 'Manure',
    date: dayjs('2025-09-28').toDate(),
    amount: 1000,
  })
  await batch.update({ closed_on: dayjs('2025-10-01').toDate() })
  return { farm, season, batch, supplier, buyer }
}

const cleanCompany = async (masterId) => {
  const scope = { where: { master_id: masterId }, force: true }
  await BatchDailyLogModel.destroy({ where: { master_id: masterId } })
  await BatchReportSnapshotModel.destroy({ where: { master_id: masterId } })
  await SalesModel.destroy(scope)
  await PurchaseReturnModel.destroy(scope)
  await PurchaseBook.destroy(scope)
  await PurchaseModel.destroy(scope)
  await GeneralExpenseModel.destroy(scope)
  await ExpenseSalesModel.destroy(scope)
  await ItemModel.destroy(scope)
  await BatchModel.destroy(scope)
  await VendorModel.destroy(scope)
  await FarmModel.destroy(scope)
  await SeasonModel.destroy(scope)
  await SubscriptionModel.destroy({ where: { user_id: masterId }, force: true })
  await UserModel.destroy({ where: { id: masterId }, force: true })
}

describe('Reports', () => {
  let role
  let staffRole
  let pkg
  let owner
  let other
  let staff
  let staffToken
  let admin
  let data

  const view = (key, query = {}, token = owner.token) =>
    request(app).get(`/api/reports/${key}`).query(query).set(authHeader(token))

  const exportReport = (key, query = {}, token = owner.token) =>
    request(app)
      .get(`/api/reports/${key}/export`)
      .query({ format: 'xlsx', ...query })
      .set(authHeader(token))

  const managerUser = () => ({ id: owner.manager.id, user_type: 'manager' })

  beforeAll(async () => {
    await connectDB()
    role = await createSystemRoleWithKeys(unique('reportrole'), REPORT_KEYS)
    staffRole = await createSystemRoleWithKeys(unique('reportstaff'), [
      'batch:read',
    ])
    pkg = await PackageModel.create({
      name: unique('reportpkg'),
      description: 'Reports test package',
      price: 1,
      actual_price: 1,
      duration: 1,
      status: 'active',
      role_id: role.id,
    })
    owner = await createManager(pkg)
    other = await createManager(pkg)
    staff = await createUser({
      user_type: 'staff',
      parent_id: owner.manager.id,
    })
    await UserRoleAssignment.create({
      user_id: staff.id,
      role_id: staffRole.id,
    })
    staffToken = await loginAs(staff.username, 'root')
    admin = await loginAs('superadmin', 'admin123')
    data = await seedCompany(owner.manager.id)
  })

  afterAll(async () => {
    if (staff) {
      await UserRoleAssignment.destroy({ where: { user_id: staff.id } })
      await UserModel.destroy({ where: { id: staff.id }, force: true })
    }
    for (const entry of [owner, other].filter(Boolean)) {
      await cleanCompany(entry.manager.id)
    }
    if (pkg) await PackageModel.destroy({ where: { id: pkg.id }, force: true })
    for (const r of [role, staffRole].filter(Boolean)) {
      await RolePermissionModel.destroy({ where: { role_id: r.id } })
      await RoleModel.destroy({ where: { id: r.id }, force: true })
    }
  })

  describe('matches the existing screens', () => {
    it('batch performance (financial) matches the batch overview', async () => {
      const res = await view('batch_financial', { season_id: data.season.id })
      expect(res.status).toBe(200)
      const row = res.body.data.sections[0].rows.find(
        (entry) => entry.name === 'Report Batch'
      )
      const overview = await overviewService.getBatchOverview(
        { batch_id: data.batch.id, ...PAGES },
        managerUser()
      )
      const calc = overview.overviewCalculations
      expect(row.expense).toBe(64000)
      expect(row.expense).toBeCloseTo(calc.total_expense, 2)
      expect(row.revenue).toBeCloseTo(calc.total_sale_amount, 2)
      expect(row.fcr).toBeCloseTo(calc.fcr, 3)
      expect(row.cfcr).toBeCloseTo(calc.cfcr, 3)
      expect(row.chicks_placed).toBe(1000)
    })

    it('batch performance (daily log) matches the daily log summary', async () => {
      const res = await view('batch_daily_log', { batch_id: data.batch.id })
      expect(res.status).toBe(200)
      const [row] = res.body.data.sections[0].rows
      const log = await request(app)
        .get(`/api/batches/${data.batch.id}/daily-logs`)
        .set(authHeader(owner.token))
      expect(log.status).toBe(200)
      const { summary } = log.body.data
      expect(row.mortality).toBe(15)
      expect(row.birds_on_farm).toBe(1000 - 15 - 900)
      expect(row.sold_birds).toBe(900)
      expect(row.birds_on_farm).toBe(summary.birds_alive)
      expect(row.sold_birds).toBe(summary.total_sold_birds)
      expect(row.mortality).toBe(summary.total_mortality)
    })

    it('supplier outstanding matches the purchase book balance', async () => {
      const res = await view('supplier_outstanding')
      expect(res.status).toBe(200)
      const row = res.body.data.sections[0].rows.find(
        (entry) => entry.vendor_name === 'Report Supplier'
      )
      const ledger = await purchaseService.buildPurchaseBookLedger(
        { vendor_id: data.supplier.id },
        managerUser()
      )
      expect(row.balance).toBe(1000 + 70000 - 4000 - 10000)
      expect(row.balance).toBeCloseTo(ledger.summary.balance, 2)

      const before = await view('supplier_outstanding', { as_of: '2025-09-10' })
      const early = before.body.data.sections[0].rows.find(
        (entry) => entry.vendor_name === 'Report Supplier'
      )
      expect(early.balance).toBe(1000 + 70000)
    })

    it('profit and loss matches the season overview', async () => {
      const res = await view('profit_loss', { season_id: data.season.id })
      expect(res.status).toBe(200)
      const net = res.body.data.summary.find(
        (entry) => entry.label === 'Net Profit'
      )
      const season = await overviewService.getSeasonOverview(
        {
          season_id: data.season.id,
          b_page: 1,
          b_limit: 10,
          gc_page: 1,
          gc_limit: 10,
          gs_page: 1,
          gs_limit: 10,
        },
        managerUser()
      )
      expect(net.value).toBe(180000 - 64000 + 1000 - 5000)
      expect(net.value).toBeCloseTo(season.summary.net_season_profit, 2)
    })

    it('builds the other company reports', async () => {
      const reports = [
        ['farm_comparison', { season_id: data.season.id }],
        ['daily_production', { batch_id: data.batch.id }],
        ['sales_register', { season_id: data.season.id }],
        ['buyer_sales', { season_id: data.season.id }],
        ['purchase_register', { season_id: data.season.id }],
        ['expense_breakdown', { season_id: data.season.id }],
      ]
      for (const [key, query] of reports) {
        const res = await view(key, query)
        expect(res.status, key).toBe(200)
        expect(res.body.data.sections.length, key).toBeGreaterThan(0)
      }
      const sales = await view('sales_register', { season_id: data.season.id })
      expect(sales.body.data.sections[0].rows).toHaveLength(1)
      expect(sales.body.data.sections[0].pagination.count).toBe(1)
    })
  })

  describe('access', () => {
    it('keeps each company to its own data', async () => {
      const res = await view(
        'batch_financial',
        { season_id: data.season.id },
        other.token
      )
      expect(res.status).toBe(200)
      expect(res.body.data.sections[0].rows).toHaveLength(0)
    })

    it('ignores company_id from company users', async () => {
      const res = await view(
        'batch_financial',
        { season_id: data.season.id, company_id: owner.manager.id },
        other.token
      )
      expect(res.status).toBe(200)
      expect(res.body.data.sections[0].rows).toHaveLength(0)
    })

    it('needs the report permission', async () => {
      const res = await view(
        'batch_financial',
        { season_id: data.season.id },
        staffToken
      )
      expect(res.status).toBe(403)
      const list = await request(app)
        .get('/api/reports')
        .set(authHeader(staffToken))
      expect(list.status).toBe(200)
      expect(list.body.data).toHaveLength(0)
    })

    it('needs the export permission to export', async () => {
      const res = await exportReport('batch_daily_log', {
        batch_id: data.batch.id,
      })
      expect(res.status).toBe(403)
    })

    it('hides platform reports from companies', async () => {
      const res = await view('subscription_revenue')
      expect(res.status).toBe(403)
    })

    it('lets super admin run company reports for a chosen company', async () => {
      const missing = await view(
        'batch_financial',
        { season_id: data.season.id },
        admin
      )
      expect(missing.status).toBe(400)
      expect(missing.body.error.code).toBe('REPORT_COMPANY_REQUIRED')

      const res = await view(
        'batch_financial',
        { season_id: data.season.id, company_id: owner.manager.id },
        admin
      )
      expect(res.status).toBe(200)
      expect(res.body.data.sections[0].rows).toHaveLength(1)
      expect(res.body.data.meta[0]).toEqual({
        label: 'Company',
        value: owner.manager.name,
      })

      const platform = await view('tenant_usage', {}, admin)
      expect(platform.status).toBe(200)
    })

    it('returns filter options for the chosen company', async () => {
      const res = await request(app)
        .get('/api/reports/options')
        .query({ company_id: owner.manager.id })
        .set(authHeader(admin))
      expect(res.status).toBe(200)
      expect(res.body.data.batches.map((b) => b.id)).toContain(data.batch.id)
      expect(res.body.data.suppliers.map((v) => v.id)).toContain(
        data.supplier.id
      )
      const denied = await request(app)
        .get('/api/reports/options')
        .set(authHeader(staffToken))
      expect(denied.status).toBe(403)
    })
  })

  describe('limits', () => {
    it('requires a scope or a bounded date range', async () => {
      const none = await view('batch_financial')
      expect(none.status).toBe(400)
      const wide = await view('batch_financial', {
        start_date: '2024-01-01',
        end_date: '2025-06-30',
      })
      expect(wide.status).toBe(400)
      const ok = await view('batch_financial', {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      })
      expect(ok.status).toBe(200)
      const daily = await view('daily_production', {
        start_date: '2025-08-01',
        end_date: '2025-10-30',
      })
      expect(daily.status).toBe(400)
    })

    it('rejects exports over the row limit', async () => {
      const limit = EXPORT_LIMITS.xlsx
      EXPORT_LIMITS.xlsx = 0
      try {
        const res = await exportReport('sales_register', {
          season_id: data.season.id,
        })
        expect(res.status).toBe(422)
        expect(res.body.error.code).toBe('REPORT_TOO_LARGE')
      } finally {
        EXPORT_LIMITS.xlsx = limit
      }
      const ok = await exportReport('sales_register', {
        season_id: data.season.id,
      })
      expect(ok.status).toBe(200)
    })

    it('allows one export at a time per user', async () => {
      let release
      const running = withExportLock(
        owner.manager.id,
        () => new Promise((resolve) => (release = resolve))
      )
      const res = await exportReport('batch_financial', {
        season_id: data.season.id,
      })
      expect(res.status).toBe(429)
      release()
      await running
    })
  })

  describe('snapshots and cache', () => {
    it('stores closed batch figures and clears them when data changes', async () => {
      await view('batch_financial', { batch_id: data.batch.id })
      const snapshot = await BatchReportSnapshotModel.findOne({
        where: { batch_id: data.batch.id, kind: 'overview' },
      })
      expect(snapshot).toBeTruthy()
      expect(Number(snapshot.data.revenue)).toBe(180000)

      const sale = await SalesModel.create({
        master_id: owner.manager.id,
        season_id: data.season.id,
        batch_id: data.batch.id,
        date: dayjs('2025-09-30').toDate(),
        buyer_id: data.buyer.id,
        weight: 100,
        bird_no: 50,
        amount: 10000,
      })
      const cleared = await BatchReportSnapshotModel.findOne({
        where: { batch_id: data.batch.id, kind: 'overview' },
      })
      expect(cleared).toBeNull()

      const cached = await view('batch_financial', { batch_id: data.batch.id })
      expect(cached.body.data.sections[0].rows[0].revenue).toBe(180000)

      const req = { method: 'POST', user: { master_id: owner.manager.id } }
      const res = Object.assign(new EventEmitter(), { statusCode: 201 })
      reportCacheInvalidator(req, res, () => {})
      res.emit('finish')

      const fresh = await view('batch_financial', { batch_id: data.batch.id })
      expect(fresh.body.data.sections[0].rows[0].revenue).toBe(190000)

      await sale.destroy({ force: true })
    })
  })
})
