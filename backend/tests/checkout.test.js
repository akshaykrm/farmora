import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { approveSignup } from './helpers/approval.js'
import { createHmac, randomUUID } from 'node:crypto'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import PackageModel from '@models/package'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PaymentModel from '@models/payment'
import CheckoutOrder from '@models/checkoutorder'
import PaymentSettings from '@models/paymentgatewaysettings'
import ReferralPartnerModel from '@models/referralpartner'
import ReferralLedger from '@models/referralledgertransaction'
import razorpay from '@services/razorpay.service'
import settings from '@services/payment-settings.service'

const payments = new Map()
const actualCreateOrder = razorpay.createOrder
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const hmac = (body, secret) =>
  createHmac('sha256', secret).update(body).digest('hex')
let adminToken
let paidPlan
let freePlan
let partner

const signup = async (plan = paidPlan, extra = {}) => {
  const username = `checkout_${randomUUID().replaceAll('-', '')}`
  const response = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Checkout Tester',
      username,
      email: `${username}@example.com`,
      phone: '9000000123',
      password: 'TestPassword123!',
      status: 1,
      package_id: plan.id,
      ...extra,
    })
  expect(response.status, JSON.stringify(response.body.error)).toBe(201)
  const data = await approveSignup(
    response.body.data,
    username,
    'TestPassword123!',
    adminToken
  )
  return { ...data, username }
}
const start = (
  user,
  kind = 'initial',
  requestId = randomUUID(),
  plan = paidPlan
) =>
  request(app)
    .post('/api/checkout/orders')
    .set(auth(user.checkout_token || user.token))
    .send({ package_id: plan.id, kind, request_id: requestId })
const paymentFor = (order, overrides = {}) => {
  const payment = {
    id: `pay_${randomUUID()}`,
    order_id: order.razorpay_order_id,
    amount: order.amount,
    currency: 'INR',
    status: 'captured',
    method: 'upi',
    ...overrides,
  }
  payments.set(payment.id, payment)
  return payment
}
const verification = async (order, payment) => {
  const row = await CheckoutOrder.findByPk(order.id)
  const credentials = await settings.credentials(row.gateway_settings_id)
  return {
    razorpay_order_id: order.razorpay_order_id,
    razorpay_payment_id: payment.id,
    razorpay_signature: hmac(
      `${order.razorpay_order_id}|${payment.id}`,
      credentials.key_secret
    ),
  }
}
const verify = async (user, order, payment, overrides = {}) =>
  request(app)
    .post(`/api/checkout/orders/${order.id}/verify`)
    .set(auth(user.checkout_token || user.token))
    .send({ ...(await verification(order, payment)), ...overrides })

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use a dedicated *_test database for checkout tests')
  vi.stubEnv('PAYMENT_SETTINGS_ENCRYPTION_KEY', 'ab'.repeat(32))
  await sequelize.authenticate()
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'admin123' })
  expect(login.status).toBe(200)
  adminToken = login.body.data.token
  const basic = await PackageModel.findOne({ where: { name: 'Basic' } })
  paidPlan = await PackageModel.create({
    name: `Checkout paid ${randomUUID()}`,
    description: 'Payment integration test',
    actual_price: '1200.50',
    discount_price: '200.25',
    duration: 3,
    status: 'active',
    role_id: basic.role_id,
    referral_bonus_type: 'fixed',
    referral_bonus_value: 75,
  })
  freePlan = await PackageModel.create({
    name: `Checkout free ${randomUUID()}`,
    description: 'Free package test',
    actual_price: 100,
    discount_price: 100,
    duration: 1,
    status: 'active',
    role_id: basic.role_id,
  })
  partner = await ReferralPartnerModel.create({
    name: 'Checkout Partner',
    code: `CP${Date.now()}`,
    status: 'active',
    referral_bonus_type: 'fixed',
    referral_bonus_value: 50,
  })
  vi.spyOn(razorpay, 'createOrder').mockImplementation(async (order) => ({
    id: `order_${randomUUID()}`,
    amount: order.amount,
    currency: order.currency,
  }))
  vi.spyOn(razorpay, 'fetchPayment').mockImplementation(async (id) => {
    if (!payments.has(id)) throw new Error('Mock payment not found')
    return payments.get(id)
  })
  vi.spyOn(razorpay, 'fetchOrderPayments').mockImplementation(
    async (order) => ({
      items: [...payments.values()].filter(
        (payment) => payment.order_id === order.razorpay_order_id
      ),
    })
  )
}, 20000)

afterAll(async () => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  await sequelize.close()
})

describe('Admin payment settings', () => {
  it('tests saved connection without creating a payment and reports rejected credentials', async () => {
    // Use an isolated settings stub; no real Razorpay requests leave the test.
    const credentials = vi.spyOn(settings, 'credentials').mockResolvedValue({
      key_id: 'rzp_test_Isolated',
      key_secret: 'isolated_secret',
    })
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    try {
      const result = await request(app)
        .post('/api/settings/razorpay/test')
        .set(auth(adminToken))
      expect(result.status).toBe(200)
      expect(result.body.data).toEqual({ connected: true, mode: 'test' })
      expect(fetch.mock.calls[0][0]).toBe(
        'https://api.razorpay.com/v1/orders?count=1'
      )
      fetch.mockResolvedValueOnce({ ok: false, status: 401 })
      const rejected = await request(app)
        .post('/api/settings/razorpay/test')
        .set(auth(adminToken))
      expect(rejected.status).toBe(502)
      expect(rejected.body.error.code).toBe('RAZORPAY_AUTHENTICATION_FAILED')
    } finally {
      fetch.mockRestore()
      credentials.mockRestore()
    }
  })
  it('encrypts secrets and never sends them back to the browser', async () => {
    const response = await request(app)
      .put('/api/settings/razorpay')
      .set(auth(adminToken))
      .send({
        key_id: 'rzp_test_CheckoutTest',
        key_secret: 'test_key_secret_12345',
        webhook_secret: 'test_webhook_secret_12345',
      })
    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      secret_configured: true,
      webhook_configured: true,
    })
    expect(JSON.stringify(response.body)).not.toContain('test_key_secret_12345')
    expect(JSON.stringify(response.body)).not.toContain(
      'test_webhook_secret_12345'
    )
    const row = await PaymentSettings.findOne({ order: [['id', 'DESC']] })
    expect(row.encrypted_key_secret).not.toContain('test_key_secret_12345')
    expect((await settings.credentials(row.id)).key_secret).toBe(
      'test_key_secret_12345'
    )
    const read = await request(app)
      .get('/api/settings/razorpay')
      .set(auth(adminToken))
    expect(read.status).toBe(200)
    expect(read.body.data.key_secret).toBeUndefined()
  })
  it('rejects anonymous access and unauthenticated password reset', async () => {
    expect((await request(app).get('/api/settings/razorpay')).status).toBe(401)
    expect(
      (
        await request(app)
          .post('/api/auth/reset-password')
          .send({ username: 'superadmin', new_password: 'bad' })
      ).status
    ).toBe(401)
  })
  it('preserves saved secrets on blank fields and rejects a key change without its secret', async () => {
    const saved = await request(app)
      .put('/api/settings/razorpay')
      .set(auth(adminToken))
      .send({
        key_id: 'rzp_test_CheckoutTest',
        key_secret: '',
        webhook_secret: '',
      })
    expect(saved.status).toBe(200)
    expect(saved.body.data.webhook_configured).toBe(true)
    expect(
      (
        await request(app)
          .put('/api/settings/razorpay')
          .set(auth(adminToken))
          .send({ key_id: 'rzp_test_OtherKey' })
      ).status
    ).toBe(400)
  })
})

describe('Package checkout lifecycle', () => {
  it('saves a paid account without activating access and issues only a restricted token', async () => {
    const user = await signup()
    expect(user.checkout_required).toBe(true)
    expect(user.password).toBeUndefined()
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      0
    )
    expect(
      (await request(app).get('/api/farms').set(auth(user.checkout_token)))
        .status
    ).toBe(401)
    expect(
      (
        await request(app)
          .get('/api/settings/razorpay')
          .set(auth(user.checkout_token))
      ).status
    ).toBe(401)
    expect(
      (
        await request(app)
          .post('/api/checkout/access')
          .set(auth(user.checkout_token))
      ).status
    ).toBe(403)
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'TestPassword123!' })
    expect(login.status).toBe(200)
    expect(login.body.data.checkout_required).toBe(true)
    expect(login.body.data.token).toBeUndefined()
  })
  it('activates free signup atomically without opening Razorpay', async () => {
    const calls = razorpay.createOrder.mock.calls.length
    const user = await signup(freePlan)
    expect(user.checkout_required).toBe(false)
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      1
    )
    expect(razorpay.createOrder.mock.calls.length).toBe(calls)
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'TestPassword123!' })
    expect(login.body.data.token).toBeTruthy()
    expect(
      (
        await request(app)
          .get('/api/settings/razorpay')
          .set(auth(login.body.data.token))
      ).status
    ).toBe(403)
  })
  it('calculates amount server-side and reuses concurrent unpaid attempts', async () => {
    const user = await signup()
    const responses = await Promise.all([start(user), start(user)])
    for (const response of responses) expect(response.status).toBe(200)
    const [first, second] = responses.map((response) => response.body.data)
    expect(first.amount).toBe(100025)
    expect(first.id).toBe(second.id)
    expect(first.razorpay_order_id).toBe(second.razorpay_order_id)
    expect(await PaymentModel.count({ where: { user_id: user.id } })).toBe(0)
    const tampered = await request(app)
      .post('/api/checkout/orders')
      .set(auth(user.checkout_token))
      .send({
        package_id: paidPlan.id,
        kind: 'initial',
        request_id: randomUUID(),
        amount: 1,
      })
    expect(tampered.status).toBe(400)
  })
  it('rejects invalid signatures, wrong ownership, wrong amounts, and uncaptured payments', async () => {
    const user = await signup()
    const other = await signup()
    const order = (await start(user)).body.data
    const payment = paymentFor(order)
    expect(
      (
        await verify(user, order, payment, {
          razorpay_signature: '0'.repeat(64),
        })
      ).status
    ).toBe(400)
    expect((await verify(other, order, payment)).status).toBe(404)
    payment.status = 'authorized'
    expect((await verify(user, order, payment)).status).toBe(409)
    payment.status = 'captured'
    payment.amount = 1
    expect((await verify(user, order, payment)).status).toBe(409)
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      0
    )
  })
  it('activates once across concurrent verification and webhook delivery, including referral credit', async () => {
    const user = await signup(paidPlan, { referral_code: partner.code })
    const order = (await start(user)).body.data
    expect(
      await ReferralLedger.count({ where: { company_user_id: user.id } })
    ).toBe(0)
    const payment = paymentFor(order)
    const raw = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: payment } },
    })
    const row = await CheckoutOrder.findByPk(order.id)
    const credentials = await settings.credentials(row.gateway_settings_id)
    const results = await Promise.all([
      verify(user, order, payment),
      verify(user, order, payment),
      request(app)
        .post('/api/payments/razorpay/webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', hmac(raw, credentials.webhook_secret))
        .send(raw),
    ])
    for (const result of results) expect(result.status).toBe(200)
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      1
    )
    expect(await PaymentModel.count({ where: { user_id: user.id } })).toBe(1)
    const bonus = await ReferralLedger.findAll({
      where: { company_user_id: user.id },
    })
    expect(bonus).toHaveLength(1)
    expect(Number(bonus[0].amount)).toBe(50)
    expect(
      (
        await request(app)
          .post('/api/checkout/access')
          .set(auth(user.checkout_token))
      ).body.data.token
    ).toBeTruthy()
  })
  it('rejects spoofed webhook bytes and reconciles a browser-closed payment by status', async () => {
    const user = await signup()
    const order = (await start(user)).body.data
    const payment = paymentFor(order)
    const raw = JSON.stringify({
      event: 'order.paid',
      payload: { payment: { entity: payment } },
    })
    const rejected = await request(app)
      .post('/api/payments/razorpay/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', '0'.repeat(64))
      .send(raw)
    expect(rejected.status).toBe(400)
    const response = await request(app)
      .get(`/api/checkout/orders/${order.id}`)
      .set(auth(user.checkout_token))
    expect(response.status).toBe(200)
    expect(response.body.data.status).toBe('completed')
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      1
    )
  })
  it('keeps failed attempts pending for retry without granting a subscription', async () => {
    const user = await signup()
    const order = (await start(user)).body.data
    paymentFor(order, { status: 'failed' })
    const response = await request(app)
      .get(`/api/checkout/orders/${order.id}`)
      .set(auth(user.checkout_token))
    expect(response.body.data.status).toBe('pending')
    expect((await start(user)).body.data.id).toBe(order.id)
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      0
    )
  })
  it('rolls back partial activation and recovers on retry', async () => {
    const user = await signup()
    const order = (await start(user)).body.data
    const payment = paymentFor(order)
    const create = vi
      .spyOn(PaymentModel, 'create')
      .mockRejectedValueOnce(new Error('Simulated DB failure'))
    expect((await verify(user, order, payment)).status).toBe(500)
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      0
    )
    expect((await CheckoutOrder.findByPk(order.id)).status).toBe('pending')
    create.mockRestore()
    expect((await verify(user, order, payment)).status).toBe(200)
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      1
    )
  })
  it('extends renewal only after capture and treats a repeated request as the same purchase', async () => {
    const user = await signup(freePlan)
    const previous = await SubscriptionModel.findOne({
      where: { user_id: user.id },
    })
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'TestPassword123!' })
    user.token = login.body.data.token
    const requestId = randomUUID()
    const order = (await start(user, 'renewal', requestId)).body.data
    const differentRequest = await start(user, 'renewal', randomUUID())
    expect(differentRequest.status).toBe(409)
    expect(differentRequest.body.error.details.request_id).toBe(requestId)
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      1
    )
    expect((await verify(user, order, paymentFor(order))).status).toBe(200)
    const repeated = await start(user, 'renewal', requestId)
    expect(repeated.body.data.id).toBe(order.id)
    expect(repeated.body.data.status).toBe('completed')
    const rows = await SubscriptionModel.findAll({
      where: { user_id: user.id },
      order: [['id', 'ASC']],
    })
    expect(rows).toHaveLength(2)
    expect(rows[1].valid_from.getTime()).toBe(previous.valid_to.getTime())
  })
  it('keeps an existing pending order verifiable after credentials rotate', async () => {
    const user = await signup()
    const order = (await start(user)).body.data
    const payment = paymentFor(order)
    const signedBefore = await verification(order, payment)
    await request(app)
      .put('/api/settings/razorpay')
      .set(auth(adminToken))
      .send({
        key_id: 'rzp_test_RotatedKey',
        key_secret: 'rotated_secret_12345',
        webhook_secret: 'rotated_webhook_12345',
      })
    const result = await request(app)
      .post(`/api/checkout/orders/${order.id}/verify`)
      .set(auth(user.checkout_token))
      .send(signedBefore)
    expect(result.status).toBe(200)
  })
  it('keeps account recoverable if provider order creation fails', async () => {
    const user = await signup()
    razorpay.createOrder.mockRejectedValueOnce(
      new Error('Simulated provider outage')
    )
    expect((await start(user)).status).toBe(500)
    expect(await UserModel.findByPk(user.id)).toBeTruthy()
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      0
    )
    expect((await start(user)).status).toBe(200)
  })
  it('disables paid checkout when credentials are absent without losing signup', async () => {
    const user = await signup()
    const credentials = vi
      .spyOn(settings, 'credentials')
      .mockResolvedValueOnce({})
    razorpay.createOrder.mockImplementationOnce(actualCreateOrder)
    const response = await start(user)
    expect(response.status).toBe(503)
    expect(response.body.error.code).toBe('PAYMENT_NOT_CONFIGURED')
    credentials.mockRestore()
    expect(await SubscriptionModel.count({ where: { user_id: user.id } })).toBe(
      0
    )
    expect((await start(user)).status).toBe(200)
  })
  it('recovers via order.paid using the exact signed raw bytes', async () => {
    const user = await signup()
    const order = (await start(user)).body.data
    const payment = paymentFor(order)
    const row = await CheckoutOrder.findByPk(order.id)
    const credentials = await settings.credentials(row.gateway_settings_id)
    const raw = JSON.stringify(
      { event: 'order.paid', payload: { payment: { entity: payment } } },
      null,
      2
    )
    const signature = hmac(raw, credentials.webhook_secret)
    const send = (body) =>
      request(app)
        .post('/api/payments/razorpay/webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', signature)
        .send(body)
    expect((await send(`${raw} `)).status).toBe(400)
    expect((await send(raw)).status).toBe(200)
    expect((await send(raw)).status).toBe(200)
    expect(await PaymentModel.count({ where: { user_id: user.id } })).toBe(1)
  })
  it('recovers captured payment on returning to checkout without any webhook', async () => {
    const user = await signup()
    const order = (await start(user)).body.data
    paymentFor(order)
    const returned = await request(app)
      .get('/api/checkout/session')
      .set(auth(user.checkout_token))
    expect(returned.status).toBe(200)
    expect(returned.body.data.active).toBe(true)
    expect(returned.body.data.order.status).toBe('completed')
    expect(await PaymentModel.count({ where: { user_id: user.id } })).toBe(1)
  })
})
