import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import bcryptjs from 'bcryptjs'

const sent = vi.hoisted(() => [])
vi.mock('@services/mail.service', () => ({
  getMailConfig: async () => ({
    source: 'settings',
    frontendUrl: 'https://app.example.com',
  }),
  sendMail: async (to, subject, template, data) => {
    sent.push({ to, subject, template, data })
    return { success: true }
  },
}))

const { default: app } = await import('../app.js')
await import('../models/index.js')
const { sequelize } = await import('@utils/db')
const { default: UserModel } = await import('@models/user')
const { default: PasswordResetToken } =
  await import('@models/passwordresettoken')
const { resetRateLimitForTests } =
  await import('@services/password-reset.service')

const GENERIC =
  "If an account matches, we've sent a password reset link to its email address."
let user
const original = 'OriginalPass123'

const forgot = (identifier) =>
  request(app).post('/api/auth/forgot-password').send({ identifier })
const reset = (token, new_password) =>
  request(app)
    .post('/api/auth/forgot-password/reset')
    .send({ token, new_password })
const login = (password) =>
  request(app)
    .post('/api/auth/login')
    .send({ username: user.username, password })
const lastToken = () => {
  const url = sent.at(-1)?.data?.resetUrl || ''
  return new URL(url).searchParams.get('token')
}

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use a dedicated *_test database')
  await sequelize.authenticate()
  const username = `reset_${randomUUID().replaceAll('-', '').slice(0, 16)}`
  user = await UserModel.create({
    name: 'Reset Tester',
    username,
    email: `${username}@example.com`,
    password: original,
    user_type: 'manager',
    status: 1,
    approval_status: 'approved',
  })
})

beforeEach(async () => {
  sent.length = 0
  resetRateLimitForTests()
  await PasswordResetToken.destroy({ where: { user_id: user.id } })
})

afterAll(async () => {
  if (user) await user.destroy({ force: true })
})

describe('forgot password', () => {
  it('returns the same message for unknown accounts and sends nothing', async () => {
    const res = await forgot(`nobody_${randomUUID()}`)
    expect(res.status).toBe(200)
    expect(res.body.message).toBe(GENERIC)
    expect(sent).toHaveLength(0)
  })

  it('emails a single-use link that resets the password', async () => {
    const res = await forgot(user.email.toUpperCase())
    expect(res.status).toBe(200)
    expect(res.body.message).toBe(GENERIC)
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe(user.email)
    expect(sent[0].data.resetUrl).toMatch(
      /^https:\/\/app\.example\.com\/reset-password\?token=[a-f0-9]{64}$/
    )

    const token = lastToken()
    const stored = await PasswordResetToken.findOne({
      where: { user_id: user.id },
    })
    expect(stored.token_hash).not.toBe(token)

    expect((await reset(token, 'short')).status).toBe(400)
    const ok = await reset(token, 'BrandNewPass123')
    expect(ok.status, JSON.stringify(ok.body)).toBe(200)
    expect((await login('BrandNewPass123')).status).toBe(200)
    expect((await login(original)).status).not.toBe(200)

    const again = await reset(token, 'AnotherPass123')
    expect(again.status).toBe(400)
    expect(again.body.error.code).toBe('INVALID_RESET_TOKEN')
    await user.update({
      password: await bcryptjs.hash(original, 10),
    })
  })

  it('only keeps the newest link valid', async () => {
    await forgot(user.username)
    const first = lastToken()
    await forgot(user.username)
    const second = lastToken()
    expect((await reset(first, 'FirstLinkPass1')).status).toBe(400)
    expect((await reset(second, 'SecondLinkPass1')).status).toBe(200)
    await user.update({
      password: await bcryptjs.hash(original, 10),
    })
  })

  it('rejects expired links', async () => {
    await forgot(user.username)
    const token = lastToken()
    await PasswordResetToken.update(
      { expires_at: new Date(Date.now() - 1000) },
      { where: { user_id: user.id } }
    )
    const res = await reset(token, 'ExpiredPass123')
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Reset link is invalid or expired.')
  })

  it('sends at most 3 links per account in 15 minutes', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await forgot(user.username)).status).toBe(200)
    }
    expect(sent).toHaveLength(3)
  })

  it('does not email inactive accounts', async () => {
    await user.update({ status: 0 })
    await forgot(user.username)
    expect(sent).toHaveLength(0)
    await user.update({ status: 1 })
  })
})
