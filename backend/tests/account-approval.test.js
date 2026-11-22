import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import UserModel from '@models/user'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import CheckoutOrder from '@models/checkoutorder'
import { generateToken, generateCheckoutToken } from '@utils/jwt'
import { installMockGateway, paySignup } from './helpers/checkout.js'

const auth = (token) => ({ Authorization: `Bearer ${token}` })
const password = 'ApprovalTest123!'
let admin
let basic
let paid
let free
const register = async (plan, extra = {}) => {
  const username = `approval_${randomUUID().replaceAll('-', '')}`
  const response = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Approval Tester',
      username,
      email: `${username}@example.com`,
      phone: '9000000000',
      password,
      status: 1,
      package_id: plan.id,
      ...extra,
    })
  return { response, username, data: response.body.data }
}
const login = (username, pass = password) =>
  request(app).post('/api/auth/login').send({ username, password: pass })
const approve = (id, token = admin) =>
  request(app).post(`/api/users/${id}/approve`).set(auth(token))
const revoke = (id, token = admin) =>
  request(app).post(`/api/users/${id}/revoke-approval`).set(auth(token))
const denied = (res) => {
  expect(res.status, JSON.stringify(res.body)).toBe(403)
  expect(res.body.error.code).toBe('ACCOUNT_APPROVAL_REQUIRED')
}

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use a dedicated *_test database')
  await sequelize.authenticate()
  installMockGateway()
  admin = (await login('superadmin', 'admin123')).body.data.token
  basic = await PackageModel.findOne({
    where: { name: 'Basic', status: 'active' },
  })
  const plan = {
    description: 'Approval test',
    duration: 1,
    role_id: basic.role_id,
    status: 'active',
    discount_price: 0,
  }
  paid = await PackageModel.create({
    ...plan,
    name: `Premium ${randomUUID()}`,
    actual_price: 5000,
  })
  free = await PackageModel.create({
    ...plan,
    name: `Enterprise free ${randomUUID()}`,
    actual_price: 0,
  })
})
afterAll(async () => {
  vi.restoreAllMocks()
  await sequelize.close()
})

describe('Subscriber approval', () => {
  it('keeps Basic signup and login immediately available', async () => {
    const { response, data, username } = await register(basic)
    expect(response.status).toBe(201)
    expect(data.approval_status).toBe('approved')
    expect(data.checkout_required).toBe(false)
    expect((await login(username)).body.data.token).toBeTruthy()
  })

  it('registers paid accounts as pending without a checkout token or subscription', async () => {
    const { response, data, username } = await register(paid)
    expect(response.status).toBe(201)
    expect(data.approval_required).toBe(true)
    expect(data.checkout_token).toBeNull()
    expect(await SubscriptionModel.count({ where: { user_id: data.id } })).toBe(
      0
    )
    expect(await CheckoutOrder.count({ where: { user_id: data.id } })).toBe(0)
    denied(await login(username))
    expect((await login(username, 'wrong')).status).not.toBe(200)
    const list = await request(app)
      .get('/api/users?user_type=manager&page=1&limit=100')
      .set(auth(admin))
    const row = list.body.data.data.find((user) => user.id === data.id)
    expect(row.approval_status).toBe('pending')
    expect(row.requested_package.id).toBe(paid.id)
  })

  it('blocks pre-existing app and checkout tokens while approval is pending', async () => {
    const { data } = await register(paid)
    const user = await UserModel.findByPk(data.id)
    const token = generateToken(user)
    denied(await request(app).get('/api/users/me').set(auth(token)))
    for (const token of [generateToken(user), generateCheckoutToken(user)]) {
      denied(await request(app).get('/api/checkout/session').set(auth(token)))
      denied(await request(app).post('/api/checkout/access').set(auth(token)))
      denied(
        await request(app).post('/api/checkout/orders').set(auth(token)).send({
          package_id: basic.id,
          kind: 'initial',
          request_id: randomUUID(),
        })
      )
    }
    denied(
      await request(app).post('/api/checkout/orders').set(auth(admin)).send({
        user_id: user.id,
        package_id: paid.id,
        kind: 'initial',
        request_id: randomUUID(),
      })
    )
  })

  it('requires Super Admin approval and prevents public approval spoofing', async () => {
    const attempt = await register(paid, { approval_status: 'approved' })
    expect(attempt.response.status).toBe(400)
    const owner = await register(basic)
    const token = (await login(owner.username)).body.data.token
    const pending = await register(paid)
    expect((await approve(pending.data.id, token)).status).toBe(403)
    expect(
      (await request(app).post(`/api/users/${pending.data.id}/approve`)).status
    ).not.toBe(200)
    expect(
      (
        await request(app)
          .put(`/api/users/${pending.data.id}`)
          .set(auth(admin))
          .send({ approval_status: 'approved' })
      ).status
    ).toBe(400)
    expect((await UserModel.findByPk(pending.data.id)).approval_status).toBe(
      'pending'
    )
  })

  it('approves once, records the administrator, and still requires captured payment for paid plans', async () => {
    const { data, username } = await register(paid)
    const results = await Promise.all([approve(data.id), approve(data.id)])
    expect(results.map((r) => r.status)).toEqual([200, 200])
    const user = await UserModel.findByPk(data.id)
    expect(user.approval_status).toBe('approved')
    expect(user.approved_by).toBeTruthy()
    expect(user.approved_at).toBeTruthy()
    expect(await CheckoutOrder.count({ where: { user_id: data.id } })).toBe(1)
    const signedIn = await login(username)
    expect(signedIn.body.data.token).toBeUndefined()
    expect(signedIn.body.data.checkout_required).toBe(true)
    const token = signedIn.body.data.checkout_token
    expect(
      (await request(app).post('/api/checkout/access').set(auth(token))).status
    ).toBe(403)
    await paySignup(token, paid.id)
    expect(
      (await request(app).post('/api/checkout/access').set(auth(token))).body
        .data.token
    ).toBeTruthy()
    expect((await login(username)).body.data.token).toBeTruthy()
    // A paid subscription must never override a pending approval flag.
    await user.update({ approval_status: 'pending' })
    denied(await login(username))
    denied(await request(app).post('/api/checkout/access').set(auth(token)))
  })

  it('waits for approval even for free non-Basic plans and starts the term on approval', async () => {
    const { data, username } = await register(free)
    denied(await login(username))
    expect(await SubscriptionModel.count({ where: { user_id: data.id } })).toBe(
      0
    )
    const before = Date.now()
    expect((await approve(data.id)).status).toBe(200)
    const subscription = await SubscriptionModel.findOne({
      where: { user_id: data.id },
    })
    expect(+subscription.valid_from).toBeGreaterThanOrEqual(before)
    expect((await login(username)).body.data.token).toBeTruthy()
    expect((await approve(data.id)).status).toBe(200)
    expect(await SubscriptionModel.count({ where: { user_id: data.id } })).toBe(
      1
    )
  })

  it('blocks staff login and API access when their owner awaits approval', async () => {
    const { data } = await register(paid)
    const username = `approval_staff_${randomUUID()}`
    const staff = await UserModel.create({
      name: 'Staff',
      username,
      password,
      user_type: 'staff',
      parent_id: data.id,
      status: 1,
    })
    denied(await login(username))
    denied(
      await request(app)
        .get('/api/users/me')
        .set(auth(generateToken(staff)))
    )
  })

  it('revokes access for a paid subscriber and staff, then restores the same subscription', async () => {
    const { data, username } = await register(paid)
    expect((await approve(data.id)).status).toBe(200)
    const checkoutToken = (await login(username)).body.data.checkout_token
    await paySignup(checkoutToken, paid.id)
    const appToken = (await login(username)).body.data.token
    const staffName = `revoked_staff_${randomUUID()}`
    const staff = await UserModel.create({
      name: 'Staff',
      username: staffName,
      password,
      user_type: 'staff',
      parent_id: data.id,
      status: 1,
    })
    const staffToken = generateToken(staff)
    const before = (
      await SubscriptionModel.findAll({ where: { user_id: data.id } })
    ).map((s) => s.toJSON())
    const orders = await CheckoutOrder.count({ where: { user_id: data.id } })
    expect((await revoke(data.id)).status).toBe(200)
    expect((await revoke(data.id)).status).toBe(200)
    denied(await login(username))
    denied(await login(staffName))
    denied(await request(app).get('/api/users/me').set(auth(appToken)))
    denied(await request(app).get('/api/users/me').set(auth(staffToken)))
    denied(
      await request(app).post('/api/checkout/access').set(auth(checkoutToken))
    )
    expect((await approve(data.id)).status).toBe(200)
    expect((await login(username)).body.data.token).toBeTruthy()
    expect((await login(staffName)).body.data.token).toBeTruthy()
    expect(
      (await SubscriptionModel.findAll({ where: { user_id: data.id } })).map(
        (s) => s.toJSON()
      )
    ).toEqual(before)
    expect(await CheckoutOrder.count({ where: { user_id: data.id } })).toBe(
      orders
    )
  })

  it('only allows Super Admin to revoke subscriber approval and never revokes the administrator', async () => {
    const owner = await register(basic)
    const token = (await login(owner.username)).body.data.token
    expect((await revoke(owner.data.id, token)).status).toBe(403)
    expect(
      (await request(app).post(`/api/users/${owner.data.id}/revoke-approval`))
        .status
    ).not.toBe(200)
    const root = await UserModel.findOne({ where: { username: 'superadmin' } })
    expect((await revoke(root.id)).status).toBe(404)
    expect((await revoke(2147483647)).status).toBe(404)
    expect((await UserModel.findByPk(owner.data.id)).approval_status).toBe(
      'approved'
    )
  })

  it('can revoke Basic and legacy accounts and restore them without extending an expired term', async () => {
    const { data, username } = await register(basic)
    const user = await UserModel.findByPk(data.id)
    // Migration leaves existing subscribers without a requested package.
    await user.update({ requested_package_id: null })
    const subscription = await SubscriptionModel.findOne({
      where: { user_id: data.id },
    })
    await subscription.update({
      valid_from: new Date('2020-01-01'),
      valid_to: new Date('2020-02-01'),
    })
    expect((await revoke(data.id)).status).toBe(200)
    denied(await login(username))
    expect((await approve(data.id)).status).toBe(200)
    expect((await login(username)).body.data.checkout_required).toBe(true)
    expect(await SubscriptionModel.count({ where: { user_id: data.id } })).toBe(
      1
    )
    expect(+(await subscription.reload()).valid_to).toBe(
      +new Date('2020-02-01')
    )
  })

  it('reuses an unpaid checkout when access is revoked and approved again', async () => {
    const { data, username } = await register(paid)
    expect((await approve(data.id)).status).toBe(200)
    const order = await CheckoutOrder.findOne({ where: { user_id: data.id } })
    expect((await revoke(data.id)).status).toBe(200)
    expect((await approve(data.id)).status).toBe(200)
    expect((await login(username)).body.data.checkout_required).toBe(true)
    expect(await CheckoutOrder.count({ where: { user_id: data.id } })).toBe(1)
    expect((await order.reload()).status).toBe('pending')
  })

  it('rolls approval back if the selected package is unavailable', async () => {
    const { data, username } = await register(free)
    await free.update({ status: 'inactive' })
    try {
      expect((await approve(data.id)).status).toBe(404)
      expect((await UserModel.findByPk(data.id)).approval_status).toBe(
        'pending'
      )
      denied(await login(username))
    } finally {
      await free.update({ status: 'active' })
    }
  })
})
