import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import RoleModel from '@models/role'
import RolePermissionModel from '@models/rolepermission'
import VendorModel from '@models/vendor'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import BatchModel from '@models/batch'
import BatchDailyLogModel from '@models/batchdailylog'
import PurchaseModel from '@models/purchase'
import ItemModel from '@models/items.model'
import UserRoleAssignment from '@models/userroleassignment'
import { connectDB } from '@utils/db'
import SalesModel from '@models/sales'
import { createSystemRoleWithKeys } from './helpers/entitlements.js'

const unique = (prefix) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

const KEYS = [
  'batch_daily_log:read',
  'batch_daily_log:write',
  'batch_daily_log:edit',
  'batch_daily_log:delete',
  'batch_daily_log:export',
  'batch_overview:read',
  'report_bird_shortage:read',
]

const loginAs = async (username, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
  expect(res.status).toBe(200)
  return res.body.data.token
}

const createManager = async (pkg) => {
  const username = unique('dailylogmgr')
  const manager = await UserModel.create({
    name: 'Daily Log Manager',
    username,
    email: `${username}@farmora.test`,
    phone: '9999999999',
    password: 'root',
    user_type: 'manager',
    status: 1,
    parent_id: 1,
  })
  await SubscriptionModel.create({
    user_id: manager.id,
    package_id: pkg.id,
    valid_from: dayjs().subtract(1, 'day').toDate(),
    valid_to: dayjs().add(1, 'year').toDate(),
  })
  return { manager, token: await loginAs(username, 'root') }
}

const createBatchFor = async (managerId) => {
  const farm = await FarmModel.create({
    master_id: managerId,
    name: 'Daily Log Farm',
    place: 'Koorotupara',
    capacity: 5000,
  })
  const season = await SeasonModel.create({
    master_id: managerId,
    name: 'Daily Log Season',
    status: 'active',
    from_date: '2025-01-01',
    to_date: '2025-12-31',
  })
  return BatchModel.create({
    master_id: managerId,
    farm_id: farm.id,
    season_id: season.id,
    name: 'Daily Log Batch',
    status: 'active',
  })
}

describe('Batch overview bird shortage', () => {
  let role
  let pkg
  let owner
  let batch

  beforeAll(async () => {
    await connectDB()
    role = await createSystemRoleWithKeys(unique('shortrole'), KEYS)
    pkg = await PackageModel.create({
      name: unique('shortpkg'),
      description: 'Shortage test package',
      price: 1,
      actual_price: 1,
      duration: 1,
      status: 'active',
      role_id: role.id,
    })
    owner = await createManager(pkg)
    batch = await createBatchFor(owner.manager.id)
    const masterId = owner.manager.id
    const vendor = await VendorModel.create({
      master_id: masterId,
      name: 'COMARLA',
      vendor_type: 'supplier',
      address: 'Test',
      opening_balance: 0,
    })
    const chick = await ItemModel.create({
      master_id: masterId,
      name: 'Chick',
      type: 'chick',
      vendor_id: vendor.id,
    })

    // 1. purchase 1000 chicks
    await PurchaseModel.create({
      master_id: masterId,
      name: 'test',
      category_id: chick.id,
      quantity: 1000,
      total_price: 0,
      net_amount: 0,
      price_per_unit: 0,
      invoice_number: unique('inv'),
      invoice_date: dayjs('2025-09-21').toDate(),
      vendor_id: vendor.id,
      season_id: batch.season_id,
      farm_id: batch.farm_id,
      batch_id: batch.id,
    })

    // 2. sell 900 birds
    await SalesModel.create({
      master_id: masterId,
      date: dayjs('2025-10-30').toDate(),
      buyer_id: 1,
      weight: 1800,
      bird_no: 900,
      price: 100,
      amount: 180000,
      season_id: batch.season_id,
      farm_id: batch.farm_id,
      batch_id: batch.id,
    })
  })

  afterAll(async () => {
    const { manager } = owner
    const masterScope = { where: { master_id: manager.id }, force: true }
    await BatchDailyLogModel.destroy({ where: { master_id: manager.id } })
    await SalesModel.destroy(masterScope)
    await PurchaseModel.destroy(masterScope)
    await ItemModel.destroy(masterScope)
    await BatchModel.destroy(masterScope)
    await VendorModel.destroy(masterScope)
    await FarmModel.destroy(masterScope)
    await SeasonModel.destroy(masterScope)
    await SubscriptionModel.destroy({
      where: { user_id: manager.id },
      force: true,
    })
    await UserModel.destroy({ where: { id: manager.id }, force: true })
    await PackageModel.destroy({ where: { id: pkg.id }, force: true })
    await RolePermissionModel.destroy({ where: { role_id: role.id } })
    await RoleModel.destroy({ where: { id: role.id }, force: true })
  })

  const overview = async () => {
    const res = await request(app)
      .get('/api/overview/batch')
      .query({ batch_id: batch.id })
      .set(authHeader(owner.token))
    expect(res.status).toBe(200)
    return res.body.data.overviewCalculations
  }

  it('shows shortage = purchased - sold - mortality, then updates after a daily log', async () => {
    let calc = await overview()
    expect(calc.total_birds_purchased).toBe(1000)
    expect(calc.bird_shortage).toBe(100)
    expect(calc.shortage_percentage).toBeCloseTo(10)

    // 3. mark daily log with 40 deaths
    const log = await request(app)
      .post(`/api/batches/${batch.id}/daily-logs`)
      .set(authHeader(owner.token))
      .send({ date: '2025-10-01', mortality: 40 })
    expect(log.status).toBe(201)

    calc = await overview()
    expect(calc.total_mortality).toBe(40)
    expect(calc.bird_shortage).toBe(60)
    expect(calc.shortage_percentage).toBeCloseTo(6)
  })

  it('builds the Bird Shortage report for batches and farms', async () => {
    const res = await request(app)
      .get('/api/reports/bird_shortage')
      .query({ batch_id: batch.id })
      .set(authHeader(owner.token))
    expect(res.status).toBe(200)
    const [farms, batches] = res.body.data.sections
    expect(batches.rows[0]).toMatchObject({
      rank: 1,
      total_birds_purchased: 1000,
      sale_birds: 900,
      total_mortality: 40,
      bird_shortage: 60,
      shortage_percentage: 6,
    })
    expect(batches.rows[0]).toHaveProperty('fcr')
    expect(farms.rows[0]).toMatchObject({
      rank: 1,
      bird_shortage: 60,
      batches: 1,
    })
    expect(batches.total.bird_shortage).toBe(60)
  })
})
