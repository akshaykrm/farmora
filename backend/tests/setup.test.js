import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import '../models/index.js'
import PackageModel from '@models/package'
import FarmModel from '@models/farm'
import BatchModel from '@models/batch'
import ItemModel from '@models/items.model'
import VendorModel from '@models/vendor'
import { connectDB, sequelize } from '@utils/db'
import { Op } from 'sequelize'

const unique = (prefix) =>
  `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

const SYSTEM_TYPES = ['integration', 'working', 'general']

const createdUserIds = []

const signupAndLogin = async (packageId) => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const username = unique('setup')
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Setup Tester',
        username,
        email: `${username}@example.com`,
        phone: `${Math.floor(1e9 + Math.random() * 9e9)}`,
        password: 'root1234',
        status: 1,
        package_id: packageId,
      })
    if (signup.status === 201) {
      createdUserIds.push(signup.body.data.id)
      const login = await request(app)
        .post('/api/auth/login')
        .send({ username, password: 'root1234' })
      expect(login.status).toBe(200)
      return { id: signup.body.data.id, token: login.body.data.token }
    }
    if (signup.body?.error?.code !== 'PACKAGE_NOT_FOUND') {
      throw new Error(`signup failed: ${JSON.stringify(signup.body)}`)
    }
  }
  throw new Error('signup failed after retries')
}

const cleanupUsers = async (ids) => {
  if (!ids.length) return
  const replacements = { ids }
  const statements = [
    'DELETE FROM batches WHERE master_id IN (:ids)',
    'DELETE FROM seasons WHERE master_id IN (:ids)',
    'DELETE FROM farms WHERE master_id IN (:ids)',
    'DELETE FROM items WHERE master_id IN (:ids)',
    'DELETE FROM vendors WHERE master_id IN (:ids)',
    'DELETE FROM invoice_configs WHERE parent_id IN (:ids)',
    'DELETE FROM payments WHERE user_id IN (:ids)',
    'DELETE FROM transaction_logs WHERE user_id IN (:ids)',
    'DELETE FROM subscriptions WHERE user_id IN (:ids)',
    'DELETE FROM user_permissions WHERE user_id IN (:ids)',
    'DELETE FROM user_role_assignments WHERE user_id IN (:ids)',
    'DELETE FROM users WHERE id IN (:ids)',
  ]
  for (const sql of statements) {
    await sequelize.query(sql, { replacements })
  }
}

describe('New-user setup', () => {
  let packageId

  beforeAll(async () => {
    await connectDB()
    const packageRecord =
      (await PackageModel.findOne({
        where: { status: 'active', name: 'Basic' },
      })) ||
      (await PackageModel.findOne({
        where: { status: 'active', role_id: { [Op.ne]: null } },
      }))
    expect(packageRecord).toBeTruthy()
    packageId = packageRecord.id
  })

  afterAll(async () => {
    await cleanupUsers(createdUserIds)
  })

  it('reports every item as missing for a fresh manager', async () => {
    const { id, token } = await signupAndLogin(packageId)
    expect(await ItemModel.count({ where: { master_id: id } })).toBe(0)
    expect(
      await VendorModel.count({
        where: { master_id: id, vendor_type: 'internal' },
      })
    ).toBe(1)

    const res = await request(app)
      .get('/api/setup/status')
      .set(authHeader(token))

    expect(res.status).toBe(200)
    expect(res.body.data.items).toEqual({
      profile: false,
      farm: false,
      season: false,
      batch: false,
      suppliers: false,
      customers: false,
      items: false,
    })
    expect(res.body.data.completed).toBe(false)
    expect(res.body.data.defaults.items.map((item) => item.type)).toEqual(
      SYSTEM_TYPES
    )
    expect(res.body.data.systemItems).toHaveLength(3)
    expect(res.body.data.systemItems.every((item) => !item.exists)).toBe(true)
    expect(res.body.data.defaults.farm.name).toBe('Setup Tester Farm')
  })

  it('generates only the missing records and is idempotent', async () => {
    const { id, token } = await signupAndLogin(packageId)

    const first = await request(app)
      .post('/api/setup/generate')
      .set(authHeader(token))
    expect(first.status).toBe(200)
    const { created } = first.body.data
    expect(Object.keys(created).sort()).toEqual(
      ['batch', 'customer', 'farm', 'items', 'season', 'supplier'].sort()
    )
    const internal = await VendorModel.findOne({
      where: { master_id: id, vendor_type: 'internal' },
    })
    expect(created.items.map((item) => item.type).sort()).toEqual(
      [...SYSTEM_TYPES].sort()
    )
    expect(created.items.every((item) => item.vendor_id === internal.id)).toBe(
      true
    )
    expect(first.body.data.status.items).toMatchObject({
      profile: false,
      farm: true,
      season: true,
      batch: true,
      suppliers: true,
      customers: true,
      items: true,
    })

    const second = await request(app)
      .post('/api/setup/generate')
      .set(authHeader(token))
    expect(second.status).toBe(200)
    expect(second.body.data.created).toEqual({})
    expect(await FarmModel.count({ where: { master_id: id } })).toBe(1)
    expect(await BatchModel.count({ where: { master_id: id } })).toBe(1)
    expect(await ItemModel.count({ where: { master_id: id } })).toBe(3)
  })

  it('reuses an existing farm for the generated batch', async () => {
    const { id, token } = await signupAndLogin(packageId)
    const farm = await FarmModel.create({
      master_id: id,
      name: 'Existing Farm',
      own: true,
      status: 'active',
    })

    const res = await request(app)
      .post('/api/setup/generate')
      .set(authHeader(token))
    expect(res.status).toBe(200)
    expect(res.body.data.created.farm).toBeUndefined()
    expect(res.body.data.created.batch.farm_id).toBe(farm.id)
  })

  it('reports items as done only when all 3 system items exist', async () => {
    const { id, token } = await signupAndLogin(packageId)
    const internal = await VendorModel.findOne({
      where: { master_id: id, vendor_type: 'internal' },
    })
    await ItemModel.create({
      master_id: id,
      vendor_id: internal.id,
      name: 'General',
      type: 'general',
      base_price: 0,
      status: 'active',
    })

    const res = await request(app)
      .get('/api/setup/status')
      .set(authHeader(token))
    expect(res.status).toBe(200)
    expect(res.body.data.items.items).toBe(false)
    const general = res.body.data.systemItems.find(
      (item) => item.type === 'general'
    )
    expect(general.exists).toBe(true)
  })

  it('saves system and extra items in one call', async () => {
    const { id, token } = await signupAndLogin(packageId)
    const supplier = await VendorModel.create({
      master_id: id,
      name: 'Feed Supplier',
      vendor_type: 'supplier',
      address: '-',
      opening_balance: 0,
      status: 'active',
    })

    const system = [
      { type: 'general', name: 'General Expense', base_price: 10 },
      { type: 'working', name: 'Working Cost', base_price: 0 },
      { type: 'integration', name: 'Integration Cost', base_price: 0 },
    ]
    const first = await request(app)
      .post('/api/setup/items')
      .set(authHeader(token))
      .send({
        system,
        extra: [
          {
            name: 'Starter Feed',
            type: 'STARTER',
            base_price: 25,
            vendor_id: supplier.id,
          },
        ],
      })
    expect(first.status).toBe(200)
    expect(first.body.data.status.items.items).toBe(true)
    expect(first.body.data.saved.extra[0].vendor_id).toBe(supplier.id)

    const second = await request(app)
      .post('/api/setup/items')
      .set(authHeader(token))
      .send({
        system: [{ type: 'general', name: 'General Renamed', base_price: 5 }],
      })
    expect(second.status).toBe(200)

    const items = await ItemModel.findAll({ where: { master_id: id } })
    expect(items).toHaveLength(4)
    const general = items.find((item) => item.type === 'general')
    expect(general.name).toBe('General Renamed')
    expect(general.base_price).toBe(5)
  })

  it('rejects a system type or a foreign vendor in extra items', async () => {
    const owner = await signupAndLogin(packageId)
    const other = await signupAndLogin(packageId)
    const foreignSupplier = await VendorModel.create({
      master_id: other.id,
      name: 'Other Supplier',
      vendor_type: 'supplier',
      address: '-',
      opening_balance: 0,
      status: 'active',
    })

    const systemInExtra = await request(app)
      .post('/api/setup/items')
      .set(authHeader(owner.token))
      .send({
        extra: [
          {
            name: 'Working Cost',
            type: 'working',
            base_price: 0,
            vendor_id: foreignSupplier.id,
          },
        ],
      })
    expect(systemInExtra.status).toBe(400)

    const foreign = await request(app)
      .post('/api/setup/items')
      .set(authHeader(owner.token))
      .send({
        system: [{ type: 'general', name: 'General', base_price: 0 }],
        extra: [
          {
            name: 'Chicks',
            type: 'chick',
            base_price: 0,
            vendor_id: foreignSupplier.id,
          },
        ],
      })
    expect(foreign.status).toBe(404)
    expect(await ItemModel.count({ where: { master_id: owner.id } })).toBe(0)
  })

  it('creates system items on demand when setup was skipped', async () => {
    const { id, token } = await signupAndLogin(packageId)

    const working = await request(app)
      .get('/api/working-costs')
      .set(authHeader(token))
    expect(working.status).toBe(200)

    const integration = await request(app)
      .get('/api/integration-book')
      .set(authHeader(token))
    expect(integration.status).toBe(200)

    const types = (
      await ItemModel.findAll({
        where: { master_id: id, type: { [Op.in]: SYSTEM_TYPES } },
      })
    ).map((item) => item.type)
    expect(types.sort()).toEqual(['integration', 'working'])
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/setup/status')
    expect(res.status).toBe(401)
  })
})
