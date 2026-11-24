import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import UserModel from '@models/user'
import CheckoutOrder from '@models/checkoutorder'
import { generateToken } from '@utils/jwt'

let token
let basic
let owner
const plan = () =>
  PackageModel.create({
    name: `Delete test ${randomUUID()}`,
    description: 'Delete package test',
    actual_price: 500,
    discount_price: 0,
    duration: 1,
    status: 'active',
    role_id: basic.role_id,
  })
const remove = (id, auth = token) =>
  request(app)
    .delete(`/api/packages/${id}`)
    .set('Authorization', `Bearer ${auth}`)
const inUse = (res) => {
  expect(res.status).toBe(409)
  expect(res.body.error.code).toBe('PACKAGE_IN_USE')
}

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use an isolated *_test database')
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'admin123' })
  expect(login.status).toBe(200)
  token = login.body.data.token
  basic = await PackageModel.findOne({ where: { name: 'Basic' } })
  owner = await UserModel.create({
    name: 'Deletion Tester',
    username: `pkgdelete_${randomUUID()}`,
    password: 'Test123!',
    user_type: 'manager',
    parent_id: 1,
    status: 1,
  })
})
afterAll(async () => {
  await sequelize.close()
})

describe('Delete packages', () => {
  it('soft deletes an unused package and removes it from all selectors', async () => {
    const pkg = await plan()
    expect((await remove(pkg.id)).status).toBe(200)
    expect(await PackageModel.findByPk(pkg.id)).toBeNull()
    expect(
      (await PackageModel.findByPk(pkg.id, { paranoid: false })).deletedAt
    ).toBeTruthy()
    expect((await request(app).get(`/api/packages/${pkg.id}`)).status).toBe(404)
    const names = await request(app).get('/api/packages/names')
    expect(names.body.data.some((item) => item.id === pkg.id)).toBe(false)
    const list = await request(app)
      .get('/api/packages')
      .query({ name: pkg.name })
    expect(list.body.data.data).toEqual([])
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Tester',
        username: `deleted_${randomUUID()}`,
        email: `deleted_${randomUUID()}@example.com`,
        phone: '9000000000',
        password: 'Test123!',
        status: 1,
        package_id: pkg.id,
      })
    expect(signup.status).toBe(404)
    expect((await remove(pkg.id)).status).toBe(404)
  })

  it('protects Basic and denies unauthenticated users and users without delete permission', async () => {
    inUse(await remove(basic.id))
    const pkg = await plan()
    expect(
      (await request(app).delete(`/api/packages/${pkg.id}`)).status
    ).not.toBe(200)
    expect((await remove(pkg.id, generateToken(owner))).status).toBe(403)
    expect(await PackageModel.findByPk(pkg.id)).toBeTruthy()
  })

  it('preserves packages used by current, expired, or soft-deleted subscriptions', async () => {
    const pkg = await plan()
    const sub = await SubscriptionModel.create({
      user_id: owner.id,
      package_id: pkg.id,
      valid_from: new Date('2020-01-01'),
      valid_to: new Date('2020-02-01'),
      kind: 'initial',
    })
    inUse(await remove(pkg.id))
    await sub.destroy()
    inUse(await remove(pkg.id))
    expect(await PackageModel.findByPk(pkg.id)).toBeTruthy()
  })

  it('preserves packages requested by accounts awaiting approval', async () => {
    const pkg = await plan()
    await owner.update({ requested_package_id: pkg.id })
    inUse(await remove(pkg.id))
    await owner.update({ requested_package_id: null })
    expect((await remove(pkg.id)).status).toBe(200)
  })

  it('preserves packages linked to checkout orders', async () => {
    const pkg = await plan()
    await CheckoutOrder.create({
      user_id: owner.id,
      package_id: pkg.id,
      request_id: randomUUID(),
      kind: 'initial',
      amount: 50000,
      currency: 'INR',
      package_snapshot: pkg.toJSON(),
      status: 'pending',
    })
    inUse(await remove(pkg.id))
    expect(await PackageModel.findByPk(pkg.id)).toBeTruthy()
  })
})
