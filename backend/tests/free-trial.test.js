import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import UserModel from '@models/user'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import CheckoutOrder from '@models/checkoutorder'
import { generateToken } from '@utils/jwt'
import freeTrial from '@services/free-trial.service'
import { installMockGateway, payOrder } from './helpers/checkout.js'

let free
let otherFree
let paid
let admin
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const actor = async () => {
  const user = await UserModel.create({
    name: 'Trial Tester',
    username: `trial_${randomUUID()}`,
    password: 'Test123!',
    user_type: 'manager',
    parent_id: 1,
    status: 1,
  })
  return { user, token: generateToken(user) }
}
const order = (who, plan = free, kind = 'initial', requestId = randomUUID()) =>
  request(app)
    .post('/api/checkout/orders')
    .set(auth(who.token))
    .send({ package_id: plan.id, kind, request_id: requestId })
const choices = (who) =>
  request(app).get('/api/subscriptions/package-options').set(auth(who.token))

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use an isolated *_test database')
  installMockGateway()
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'admin123' })
  admin = login.body.data.token
  const basic = await PackageModel.findOne({ where: { name: 'Basic' } })
  const data = {
    description: 'Trial test',
    actual_price: 100,
    discount_price: 100,
    duration: 1,
    status: 'active',
    role_id: basic.role_id,
  }
  free = await PackageModel.create({ ...data, name: `Trial ${randomUUID()}` })
  otherFree = await PackageModel.create({
    ...data,
    name: `Other trial ${randomUUID()}`,
  })
  paid = await PackageModel.create({
    ...data,
    actual_price: 500,
    discount_price: 0,
    name: `Paid ${randomUUID()}`,
  })
})
afterAll(async () => {
  vi.restoreAllMocks()
  await sequelize.close()
})

describe('One free trial per subscriber', () => {
  it('allows the first trial, hides all free choices afterward, and rejects repeat trial orders', async () => {
    const who = await actor()
    expect((await choices(who)).body.data.some((p) => p.id === free.id)).toBe(
      true
    )
    const first = await order(who)
    expect(first.status).toBe(200)
    expect(first.body.data.status).toBe('completed')
    expect((await who.user.reload()).free_trial_used_at).toBeTruthy()
    const options = await choices(who)
    expect(options.status).toBe(200)
    expect(
      options.body.data.some((p) => p.id === free.id || p.id === otherFree.id)
    ).toBe(false)
    expect(options.body.data.some((p) => p.id === paid.id)).toBe(true)
    const session = await request(app)
      .get('/api/checkout/session')
      .set(auth(who.token))
    expect(session.body.data.free_trial_used).toBe(true)
    expect(session.body.data.packages.some((p) => p.id === free.id)).toBe(false)
    for (const plan of [free, otherFree]) {
      const again = await order(who, plan, 'renewal')
      expect(again.status).toBe(403)
      expect(again.body.error.code).toBe('FREE_TRIAL_ALREADY_USED')
    }
    expect(
      await SubscriptionModel.count({ where: { user_id: who.user.id } })
    ).toBe(1)
  })

  it('keeps a completed trial request idempotent without creating another trial', async () => {
    const who = await actor()
    const id = randomUUID()
    const first = await order(who, free, 'initial', id)
    const repeat = await order(who, free, 'initial', id)
    expect(repeat.status).toBe(200)
    expect(repeat.body.data.id).toBe(first.body.data.id)
    expect(
      await SubscriptionModel.count({ where: { user_id: who.user.id } })
    ).toBe(1)
  })

  it('does not reset trial eligibility when the subscription expires or is deleted', async () => {
    const who = await actor()
    expect((await order(who)).status).toBe(200)
    await SubscriptionModel.update(
      { valid_to: dayjs().subtract(1, 'day').toDate() },
      { where: { user_id: who.user.id } }
    )
    expect((await order(who, free, 'renewal')).status).toBe(403)
    await SubscriptionModel.destroy({ where: { user_id: who.user.id } })
    expect((await order(who)).body.error.code).toBe('FREE_TRIAL_ALREADY_USED')
    expect((await choices(who)).body.data.some((p) => p.id === free.id)).toBe(
      false
    )
  })

  it('detects legacy trial subscriptions even when soft deleted and unmarked', async () => {
    const who = await actor()
    const sub = await SubscriptionModel.create({
      user_id: who.user.id,
      package_id: free.id,
      valid_from: dayjs().subtract(2, 'month').toDate(),
      valid_to: dayjs().subtract(1, 'month').toDate(),
    })
    await sub.destroy()
    expect(who.user.free_trial_used_at).toBeFalsy()
    expect(await freeTrial.hasUsed(who.user)).toBe(true)
    expect((await order(who)).body.error.code).toBe('FREE_TRIAL_ALREADY_USED')
  })

  it('preserves trial usage after the original package is renamed or repriced', async () => {
    const who = await actor()
    expect((await order(who)).status).toBe(200)
    await free.update({
      name: `Renamed trial ${randomUUID()}`,
      actual_price: 500,
    })
    try {
      expect((await order(who, otherFree, 'renewal')).body.error.code).toBe(
        'FREE_TRIAL_ALREADY_USED'
      )
    } finally {
      await free.update({ actual_price: 100 })
    }
  })

  it('allows paid renewal after a trial, including the subscriber renewal route', async () => {
    const who = await actor()
    expect((await order(who)).status).toBe(200)
    const response = await request(app)
      .post('/api/subscriptions/renew')
      .set(auth(who.token))
      .send({ package_id: paid.id, request_id: randomUUID() })
    expect(response.status, JSON.stringify(response.body)).toBe(201)
    await payOrder(response.body.data, who.token)
    expect(
      await SubscriptionModel.count({ where: { user_id: who.user.id } })
    ).toBe(2)
    expect((await order(who, free, 'renewal')).body.error.code).toBe(
      'FREE_TRIAL_ALREADY_USED'
    )
  })

  it('isolates eligibility between subscribers and prevents cross-account queries', async () => {
    const used = await actor()
    const unused = await actor()
    expect((await order(used)).status).toBe(200)
    expect(
      (await choices(unused)).body.data.some((p) => p.id === free.id)
    ).toBe(true)
    expect(
      (
        await request(app)
          .get(`/api/subscriptions/package-options?user_id=${unused.user.id}`)
          .set(auth(used.token))
      ).status
    ).toBe(403)
    const options = await request(app)
      .get(`/api/subscriptions/package-options?user_id=${used.user.id}`)
      .set(auth(admin))
    expect(options.body.data.some((p) => p.id === free.id)).toBe(false)
  })

  it('allows at most one trial when requests race and refuses public marker changes', async () => {
    const who = await actor()
    const responses = await Promise.all([order(who), order(who)])
    expect(responses.filter((r) => r.status === 200)).toHaveLength(1)
    expect(
      await CheckoutOrder.count({
        where: { user_id: who.user.id, status: 'completed', amount: 0 },
      })
    ).toBe(1)
    const update = await request(app)
      .put('/api/users/me')
      .set(auth(who.token))
      .send({ free_trial_used_at: null })
    expect(update.status).toBe(400)
  })
})
