import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import ReferralPartnerModel from '@models/referralpartner'
import ReferralLedgerTransactionModel from '@models/referralledgertransaction'
import { connectDB } from '@utils/db'

const unique = (prefix) =>
  `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

const loginAs = async (username, password) => {
  const res = await request(app).post('/api/auth/login').send({
    username,
    password,
  })
  expect(res.status).toBe(200)
  return res.body.data
}

const signupManager = async (overrides = {}) => {
  let last = null
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const username = unique('mgr')
    const payload = {
      name: overrides.name || 'Test Manager',
      username,
      email: `${username}@example.com`,
      phone: `${Math.floor(Math.random() * 1e10)}`,
      password: 'root',
      status: 1,
      package_id: overrides.package_id,
      referral_code: overrides.referral_code,
    }
    const res = await request(app).post('/api/auth/signup').send(payload)
    last = { res, username, payload }
    if (res.status === 201) return last
    if (res.body?.error?.code !== 'PACKAGE_NOT_FOUND') return last
  }
  return last
}

describe('Referral bonus and renewals', () => {
  let admin
  let packageRecord
  let partner

  beforeAll(async () => {
    await connectDB()
    admin = await loginAs('superadmin', 'admin123')
    packageRecord = await PackageModel.findOne({ where: { status: 'active' } })
    expect(packageRecord).toBeTruthy()

    await packageRecord.update({
      actual_price: 5000,
      discount_price: 0,
      referral_bonus_type: 'fixed',
      referral_bonus_value: 500,
    })
    await packageRecord.reload()

    partner = await ReferralPartnerModel.create({
      name: unique('partner'),
      code: unique('REF').toUpperCase().slice(0, 20),
      status: 'active',
      phone: '9999999999',
      email: `${unique('p')}@example.com`,
    })
  })

  it('credits initial bonus on signup with referral code', async () => {
    const { res: signup, username } = await signupManager({
      package_id: packageRecord.id,
      referral_code: partner.code,
      name: 'Referred Manager',
    })
    expect(signup.status).toBe(201)

    const manager = await UserModel.findOne({ where: { username } })
    expect(manager.referral_partner_id).toBe(partner.id)

    const bonus = await ReferralLedgerTransactionModel.findOne({
      where: {
        referral_partner_id: partner.id,
        company_user_id: manager.id,
        type: 'initial_bonus',
      },
    })
    expect(bonus).toBeTruthy()
    expect(Number(bonus.amount)).toBe(500)
    expect(Number(bonus.bonus_amount)).toBe(500)
  })

  it('credits renewal bonus when package is renewed', async () => {
    const { res: signup, username } = await signupManager({
      package_id: packageRecord.id,
      referral_code: partner.code,
      name: 'Renew Manager',
    })
    expect(signup.status).toBe(201)

    const session = await loginAs(username, 'root')
    const renew = await request(app)
      .post('/api/subscriptions/renew')
      .set(authHeader(session.token))
      .send({ package_id: packageRecord.id })
    expect(renew.status).toBe(201)
    expect(renew.body.data.kind).toBe('renewal')

    const manager = await UserModel.findOne({ where: { username } })
    const renewalBonus = await ReferralLedgerTransactionModel.findOne({
      where: {
        referral_partner_id: partner.id,
        company_user_id: manager.id,
        type: 'renewal_bonus',
      },
    })
    expect(renewalBonus).toBeTruthy()
    expect(Number(renewalBonus.amount)).toBe(500)

    const subs = await SubscriptionModel.findAll({
      where: { user_id: manager.id },
    })
    expect(subs.length).toBeGreaterThanOrEqual(2)
  })

  it('manually links a company and credits bonus immediately', async () => {
    const { res: signup, username } = await signupManager({
      package_id: packageRecord.id,
      name: 'Unlinked Manager',
    })
    expect(signup.status).toBe(201)

    const manager = await UserModel.findOne({ where: { username } })
    expect(manager.referral_partner_id).toBeNull()

    const otherPartner = await ReferralPartnerModel.create({
      name: unique('partner2'),
      code: unique('RF2').toUpperCase().slice(0, 20),
      status: 'active',
    })

    const link = await request(app)
      .post(`/api/referrals/${otherPartner.id}/link-company`)
      .set(authHeader(admin.token))
      .send({ user_id: manager.id })
    expect(link.status).toBe(201)

    await manager.reload()
    expect(manager.referral_partner_id).toBe(otherPartner.id)

    const bonus = await ReferralLedgerTransactionModel.findOne({
      where: {
        referral_partner_id: otherPartner.id,
        company_user_id: manager.id,
        type: 'manual_link_bonus',
      },
    })
    expect(bonus).toBeTruthy()
    expect(bonus.remarks).toMatch(/Manually linked/i)
  })

  it('records payments and computes remaining balance', async () => {
    const list = await request(app)
      .get('/api/referrals')
      .set(authHeader(admin.token))
    expect(list.status).toBe(200)

    const detail = await request(app)
      .get(`/api/referrals/${partner.id}`)
      .set(authHeader(admin.token))
    expect(detail.status).toBe(200)
    expect(detail.body.data.total_earned).toBeGreaterThan(0)

    const payAmount = 100
    const payment = await request(app)
      .post(`/api/referrals/${partner.id}/payments`)
      .set(authHeader(admin.token))
      .send({ amount: payAmount, remarks: 'Partial payout' })
    expect(payment.status).toBe(201)

    const after = await request(app)
      .get(`/api/referrals/${partner.id}`)
      .set(authHeader(admin.token))
    expect(after.status).toBe(200)
    expect(after.body.data.total_paid).toBeGreaterThanOrEqual(payAmount)
    expect(after.body.data.balance).toBe(
      Number(
        (
          Number(after.body.data.total_earned) -
          Number(after.body.data.total_paid)
        ).toFixed(2)
      )
    )
  })

  it('returns expiring_soon on manager dashboard within 10 days', async () => {
    const { res: signup, username } = await signupManager({
      package_id: packageRecord.id,
      name: 'Expiring Manager',
    })
    expect(signup.status).toBe(201)

    const manager = await UserModel.findOne({ where: { username } })
    const sub = await SubscriptionModel.findOne({
      where: { user_id: manager.id },
      order: [['id', 'DESC']],
    })
    await sub.update({
      valid_from: dayjs().subtract(1, 'month').toDate(),
      valid_to: dayjs().add(5, 'day').toDate(),
    })

    const session = await loginAs(username, 'root')
    const dashboard = await request(app)
      .get('/api/dashboard/manager')
      .set(authHeader(session.token))
    expect(dashboard.status).toBe(200)
    expect(dashboard.body.data.subscription).toBeTruthy()
    expect(dashboard.body.data.subscription.expiring_soon).toBe(true)
    expect(dashboard.body.data.subscription.days_remaining).toBeLessThanOrEqual(
      10
    )
  })

  it('computes percentage bonus snapshot from current package config', async () => {
    await packageRecord.update({
      referral_bonus_type: 'percentage',
      referral_bonus_value: 10,
    })

    const { res: signup, username } = await signupManager({
      package_id: packageRecord.id,
      referral_code: partner.code,
      name: 'Percent Manager',
    })
    expect(signup.status).toBe(201)

    const manager = await UserModel.findOne({ where: { username } })
    const bonus = await ReferralLedgerTransactionModel.findOne({
      where: {
        company_user_id: manager.id,
        type: 'initial_bonus',
      },
      order: [['id', 'DESC']],
    })
    expect(bonus).toBeTruthy()
    expect(bonus.bonus_type).toBe('percentage')
    await packageRecord.reload()
    const effectivePrice = Math.max(
      0,
      Number(packageRecord.actual_price) - Number(packageRecord.discount_price)
    )
    const expected = Number(((effectivePrice * 10) / 100).toFixed(2))
    expect(Number(bonus.amount)).toBe(expected)

    await packageRecord.update({
      referral_bonus_type: 'fixed',
      referral_bonus_value: 500,
    })
  })
})
