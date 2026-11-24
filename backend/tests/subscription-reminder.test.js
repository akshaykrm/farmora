import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import PlatformSettings from '@models/platformsettings'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import UserModel from '@models/user'
import subscriptionService from '@services/subscription.service'
import platformSettings from '@services/platform-settings.service'
import { generateToken } from '@utils/jwt'

let adminToken
let owner
let sub
let original
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const put = (days, token = adminToken) =>
  request(app)
    .put('/api/settings/subscriptions')
    .set(auth(token))
    .send({ subscription_reminder_days: days })
const dashboard = () =>
  request(app)
    .get('/api/dashboard/manager')
    .set(auth(generateToken(owner)))

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use a dedicated *_test database')
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'admin123' })
  expect(login.status).toBe(200)
  adminToken = login.body.data.token
  original = await platformSettings.read()
  const basic = await PackageModel.findOne({ where: { name: 'Basic' } })
  owner = await UserModel.create({
    name: 'Reminder Tester',
    username: `reminder_${randomUUID()}`,
    password: 'Test123!',
    user_type: 'manager',
    parent_id: 1,
    status: 1,
  })
  sub = await SubscriptionModel.create({
    user_id: owner.id,
    package_id: basic.id,
    kind: 'initial',
    valid_from: dayjs().subtract(1, 'month').toDate(),
    valid_to: dayjs().add(20, 'day').toDate(),
  })
})
afterAll(async () => {
  await platformSettings.save(original)
  await sequelize.close()
})

describe('Configurable subscription reminder', () => {
  it('defaults to 10 days and includes the threshold in summaries', () => {
    const summary = subscriptionService.buildSubscriptionSummary({
      id: 1,
      valid_to: dayjs().add(11, 'day').toDate(),
    })
    expect(summary.reminder_days).toBe(10)
    expect(summary.expiring_soon).toBe(false)
    expect(subscriptionService.buildSubscriptionSummary(null)).toBeNull()
  })

  it('shows the reminder at the boundary and hides it before that window', () => {
    for (const [days, visible] of [
      [31, false],
      [30, true],
      [29, true],
      [0, true],
      [-1, true],
    ]) {
      const summary = subscriptionService.buildSubscriptionSummary(
        { id: 1, valid_to: dayjs().add(days, 'day').toDate() },
        30
      )
      expect(summary.expiring_soon).toBe(visible)
      expect(summary.reminder_days).toBe(30)
    }
  })

  it('supports 0 days and keeps expired subscriptions visible', () => {
    for (const [days, visible] of [
      [1, false],
      [0, true],
      [-2, true],
    ]) {
      expect(
        subscriptionService.buildSubscriptionSummary(
          { valid_to: dayjs().add(days, 'day').toDate() },
          0
        ).expiring_soon
      ).toBe(visible)
    }
  })

  it('persists the setting and reflects changes in subscriber dashboard responses', async () => {
    expect((await put(10)).status).toBe(200)
    let res = await dashboard()
    expect(res.status).toBe(200)
    expect(res.body.data.subscription.expiring_soon).toBe(false)
    expect((await put(30)).status).toBe(200)
    const saved = await request(app)
      .get('/api/settings/subscriptions')
      .set(auth(adminToken))
    expect(saved.body.data.subscription_reminder_days).toBe(30)
    expect(
      (await PlatformSettings.findByPk(1)).subscription_reminder_days
    ).toBe(30)
    res = await dashboard()
    expect(res.body.data.subscription.expiring_soon).toBe(true)
    expect(res.body.data.subscription.reminder_days).toBe(30)
    expect(+(await sub.reload()).valid_to).toBeGreaterThan(Date.now())
  })

  it('rejects invalid day counts and requires Super Admin to read or change settings', async () => {
    for (const value of [-1, 366, 1.5, null, 'abc'])
      expect((await put(value)).status).toBe(400)
    expect(
      (
        await request(app)
          .put('/api/settings/subscriptions')
          .set(auth(adminToken))
          .send({})
      ).status
    ).toBe(400)
    const ownerToken = generateToken(owner)
    expect((await put(30, ownerToken)).status).toBe(403)
    expect(
      (
        await request(app)
          .get('/api/settings/subscriptions')
          .set(auth(ownerToken))
      ).status
    ).toBe(403)
    expect(
      (await request(app).get('/api/settings/subscriptions')).status
    ).not.toBe(200)
    expect((await put(0)).status).toBe(200)
    expect((await put(365)).status).toBe(200)
  })
})
