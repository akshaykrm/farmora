import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import PaymentModel from '@models/payment'
import CheckoutOrder from '@models/checkoutorder'
import { generateToken } from '@utils/jwt'

let admin
let basic
const password = 'DaysTest123!'
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const fixture = async (expiry = dayjs().add(20, 'day')) => {
  const user = await UserModel.create({
    name: 'Days Tester',
    username: `days_${randomUUID()}`,
    password,
    user_type: 'manager',
    parent_id: 1,
    status: 1,
  })
  const sub = await SubscriptionModel.create({
    user_id: user.id,
    package_id: basic.id,
    valid_from: dayjs().subtract(30, 'day').toDate(),
    valid_to: expiry.toDate(),
    kind: 'initial',
  })
  return { user, sub }
}
const update = (sub, days, token = admin, extra = {}) =>
  request(app)
    .put(`/api/subscriptions/${sub.id}/days`)
    .set(auth(token))
    .send({ days, expected_valid_to: sub.valid_to.toISOString(), ...extra })

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use an isolated *_test database')
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'admin123' })
  expect(login.status).toBe(200)
  admin = login.body.data.token
  basic = await PackageModel.findOne({ where: { name: 'Basic' } })
})
afterAll(async () => {
  await sequelize.close()
})

describe('Admin subscription day adjustment', () => {
  it('extends and shortens expiry without changing package, start, payments, orders, or approval', async () => {
    const { user, sub } = await fixture()
    const initial = sub.toJSON()
    const payments = await PaymentModel.count({ where: { user_id: user.id } })
    const orders = await CheckoutOrder.count({ where: { user_id: user.id } })
    await user.update({ approval_status: 'pending' })
    expect((await update(sub, 10)).status).toBe(200)
    await sub.reload()
    expect(+sub.valid_to).toBe(+dayjs(initial.valid_to).add(10, 'day').toDate())
    expect((await update(sub, -5)).status).toBe(200)
    await sub.reload()
    expect(+sub.valid_to).toBe(+dayjs(initial.valid_to).add(5, 'day').toDate())
    expect(+sub.valid_from).toBe(+initial.valid_from)
    expect(sub.package_id).toBe(initial.package_id)
    expect(await PaymentModel.count({ where: { user_id: user.id } })).toBe(
      payments
    )
    expect(await CheckoutOrder.count({ where: { user_id: user.id } })).toBe(
      orders
    )
    expect((await user.reload()).approval_status).toBe('pending')
  })

  it('allows extending an expired subscription and login recognizes the new dates', async () => {
    const { user, sub } = await fixture(dayjs().subtract(5, 'day'))
    const login = () =>
      request(app)
        .post('/api/auth/login')
        .send({ username: user.username, password })
    expect((await login()).body.data.checkout_required).toBe(true)
    expect((await update(sub, 10)).status).toBe(200)
    expect((await login()).body.data.token).toBeTruthy()
  })

  it('rejects non-admin and unauthenticated adjustments', async () => {
    const { user, sub } = await fixture()
    expect((await update(sub, 10, generateToken(user))).status).toBe(403)
    expect(
      (
        await request(app)
          .put(`/api/subscriptions/${sub.id}/days`)
          .send({ days: 10, expected_valid_to: sub.valid_to })
      ).status
    ).not.toBe(200)
  })

  it('validates nonzero whole days and ensures expiry follows the start date', async () => {
    const { sub } = await fixture()
    for (const days of [0, 1.5, 3651, -3651, 'invalid', null])
      expect((await update(sub, days)).status).toBe(400)
    const sameStart = dayjs(sub.valid_to).diff(dayjs(sub.valid_from), 'day')
    expect((await update(sub, -sameStart - 1)).body.error.code).toBe(
      'INVALID_SUBSCRIPTION_DATES'
    )
    expect(
      (await update(sub, 1, admin, { expected_valid_to: 'invalid' })).status
    ).toBe(400)
  })

  it('rejects stale and repeated updates rather than adding days twice', async () => {
    const { sub } = await fixture()
    const results = await Promise.all([update(sub, 10), update(sub, 10)])
    expect(results.map((res) => res.status).sort()).toEqual([200, 409])
    expect((await update(sub, 10)).body.error.code).toBe(
      'SUBSCRIPTION_CONFLICT'
    )
  })

  it('blocks overlap with scheduled renewals and preserves the other period', async () => {
    const { user, sub } = await fixture()
    const next = await SubscriptionModel.create({
      user_id: user.id,
      package_id: basic.id,
      valid_from: sub.valid_to,
      valid_to: dayjs(sub.valid_to).add(1, 'month').toDate(),
      kind: 'renewal',
    })
    const original = +next.valid_from
    const response = await update(sub, 1)
    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('SUBSCRIPTION_OVERLAP')
    expect((await update(sub, -1)).status).toBe(200)
    expect(+(await next.reload()).valid_from).toBe(original)
    expect((await update(next, 5)).status).toBe(200)
  })

  it('returns 404 for a missing subscription', async () => {
    const response = await request(app)
      .put('/api/subscriptions/2147483647/days')
      .set(auth(admin))
      .send({ days: 5, expected_valid_to: new Date().toISOString() })
    expect(response.status).toBe(404)
  })
})
