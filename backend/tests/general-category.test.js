import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import SeasonModel from '@models/season'
import { connectDB } from '@utils/db'
import { createSystemRoleWithKeys } from './helpers/entitlements.js'

const unique = (prefix) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

const KEYS = ['expense', 'sales']
  .map((m) => (m === 'expense' ? 'general_expense' : 'general_sales'))
  .flatMap((p) => ['read', 'write', 'edit', 'delete'].map((a) => `${p}:${a}`))

describe.each([
  { label: 'expense', base: '/api/general-expenses' },
  { label: 'sale', base: '/api/general-sales' },
])('General $label categories', ({ base }) => {
  let token
  let season
  const auth = () => ({ Authorization: `Bearer ${token}` })

  beforeAll(async () => {
    await connectDB()
    const role = await createSystemRoleWithKeys(unique('catrole'), KEYS)
    const pkg = await PackageModel.create({
      name: unique('catpkg'),
      description: 'Category test package',
      price: 1,
      actual_price: 1,
      duration: 1,
      status: 'active',
      role_id: role.id,
    })
    const username = unique('catmgr')
    const manager = await UserModel.create({
      name: 'Category Manager',
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
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username, password: 'root' })
    token = login.body.data.token
    season = await SeasonModel.create({
      master_id: manager.id,
      name: 'Category Season',
      status: 'active',
      from_date: '2025-01-01',
      to_date: '2025-12-31',
    })
  })

  it('supports full CRUD and blocks deleting a category in use', async () => {
    const created = await request(app)
      .post(`${base}/categories`)
      .set(auth())
      .send({ name: 'Electricity' })
    expect(created.status).toBe(201)
    const id = created.body.data.id

    const duplicate = await request(app)
      .post(`${base}/categories`)
      .set(auth())
      .send({ name: 'electricity' })
    expect(duplicate.status).toBe(409)

    const record = await request(app)
      .post(base)
      .set(auth())
      .send({
        season_id: season.id,
        category_id: id,
        amount: 100,
        date: '2025-02-01',
      })
    expect(record.status).toBe(200)
    expect(record.body.data.purpose).toBe('Electricity')

    const renamed = await request(app)
      .put(`${base}/categories/${id}`)
      .set(auth())
      .send({ name: 'Power' })
    expect(renamed.status).toBe(200)

    const list = await request(app).get(base).set(auth())
    const row = list.body.data.data.find((r) => r.id === record.body.data.id)
    expect(row.purpose).toBe('Power')
    expect(row.category.name).toBe('Power')

    const inUse = await request(app)
      .delete(`${base}/categories/${id}`)
      .set(auth())
    expect(inUse.status).toBe(409)

    const names = await request(app)
      .get(`${base}/categories?status=active`)
      .set(auth())
    expect(names.body.data.map((c) => c.name)).toContain('Power')

    const unused = await request(app)
      .post(`${base}/categories`)
      .set(auth())
      .send({ name: 'Unused' })
    const removed = await request(app)
      .delete(`${base}/categories/${unused.body.data.id}`)
      .set(auth())
    expect(removed.status).toBe(204)
  })

  it('rejects a category id that does not belong to the tenant', async () => {
    const res = await request(app).post(base).set(auth()).send({
      season_id: season.id,
      category_id: 999999,
      amount: 5,
      date: '2025-02-01',
    })
    expect(res.status).toBe(404)
  })
})
