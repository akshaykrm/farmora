import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { approveSignup } from './helpers/approval.js'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import farmService from '@services/farm.service'
import { createSystemRoleWithKeys } from './helpers/entitlements.js'

let role
let adminToken
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const unique = () => randomUUID().replaceAll('-', '')

const plan = (limit) =>
  PackageModel.create({
    name: `Farm limit ${unique()}`,
    description: 'Farm quota test',
    actual_price: 0,
    discount_price: 0,
    duration: 1,
    status: 'active',
    role_id: role.id,
    farm_limit: limit,
  })
const tenant = async (limit) => {
  const packageRecord = await plan(limit)
  const username = `farmlimit_${unique()}`
  const signup = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Farm Limit Tester',
      username,
      email: `${username}@example.com`,
      phone: '9000000000',
      password: 'FarmLimit123!',
      status: 1,
      package_id: packageRecord.id,
    })
  expect(signup.status, JSON.stringify(signup.body.error)).toBe(201)
  await approveSignup(signup.body.data, username, 'FarmLimit123!', adminToken)
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username, password: 'FarmLimit123!' })
  expect(login.status).toBe(200)
  return {
    id: signup.body.data.id,
    token: login.body.data.token,
    user_type: 'manager',
    packageRecord,
  }
}
const createFarm = (user, name = `Farm ${unique()}`) =>
  request(app).post('/api/farms').set(auth(user.token)).send({ name })
const allowance = (user) =>
  request(app).get('/api/farms/allowance').set(auth(user.token))

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use a dedicated *_test database')
  await sequelize.authenticate()
  role = await createSystemRoleWithKeys(`Farm quota role ${unique()}`, [
    'farm:read',
    'farm:write',
    'farm:edit',
    'farm:delete',
    'dashboard:read',
  ])
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'admin123' })
  expect(login.status).toBe(200)
  adminToken = login.body.data.token
})

afterAll(async () => {
  await sequelize.close()
})

describe('Retired farm limits', () => {
  it('allows multiple farms even when the legacy farm limit is zero', async () => {
    const user = await tenant(0)
    for (let index = 0; index < 3; index++)
      expect((await createFarm(user)).status).toBe(201)
    expect((await allowance(user)).body.data).toMatchObject({
      used: 3,
      limit: null,
      can_create: true,
    })
  })
  it('preserves tenant isolation when editing farms', async () => {
    const owner = await tenant(0)
    const other = await tenant(0)
    const farm = await createFarm(owner)
    expect(
      (
        await request(app)
          .put(`/api/farms/${farm.body.data.id}`)
          .set(auth(other.token))
          .send({ name: 'Foreign edit' })
      ).status
    ).toBe(404)
  })
  it('still requires an active subscription for farm creation', async () => {
    const user = await tenant(null)
    await SubscriptionModel.update(
      { valid_to: dayjs().subtract(1, 'day').toDate() },
      { where: { user_id: user.id } }
    )
    await expect(
      farmService.create({ name: 'Expired farm' }, user)
    ).rejects.toMatchObject({ code: 'SUBSCRIPTION_REQUIRED' })
  })
})
