import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import UserModel from '@models/user'
import PackageModel from '@models/package'
import SubscriptionModel from '@models/subscription'
import PermissionModel from '@models/permission'
import UserPermissionModel from '@models/userpermission'
import userService from '@services/user.service'
import { generateToken } from '@utils/jwt'
import { createSystemRoleWithKeys } from './helpers/entitlements.js'

let admin
let role
const unique = () => randomUUID().replaceAll('-', '')
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const fixture = async (limit) => {
  const pkg = await PackageModel.create({
    name: `User quota ${unique()}`,
    description: 'Staff quota test',
    actual_price: 0,
    discount_price: 0,
    duration: 1,
    role_id: role.id,
    status: 'active',
    user_limit: limit,
  })
  const user = await UserModel.create({
    name: 'User Limit Tester',
    username: `owner_${unique()}`,
    password: 'Test123!',
    user_type: 'manager',
    parent_id: 1,
    status: 1,
  })
  await SubscriptionModel.create({
    user_id: user.id,
    package_id: pkg.id,
    valid_from: dayjs().subtract(1, 'day').toDate(),
    valid_to: dayjs().add(1, 'month').toDate(),
  })
  return { user, pkg, token: generateToken(user) }
}
const create = (owner, extra = {}) =>
  request(app)
    .post('/api/users')
    .set(auth(owner.token))
    .send({
      name: 'Staff Tester',
      username: `staff_${unique()}`,
      password: 'Test123!',
      ...extra,
    })
const allowance = (owner) =>
  request(app).get('/api/users/allowance').set(auth(owner.token))

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use an isolated *_test database')
  role = await createSystemRoleWithKeys(`User quota role ${unique()}`, [
    'user:read',
    'user:write',
    'user:edit',
    'user:delete',
    'dashboard:read',
  ])
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'superadmin', password: 'admin123' })
  expect(login.status).toBe(200)
  admin = login.body.data.token
})
afterAll(async () => {
  await sequelize.close()
})

describe('Package staff user limits', () => {
  it('allows only Super Admin to set a valid user limit', async () => {
    const owner = await fixture(null)
    for (const value of [0, 2, null]) {
      const response = await request(app)
        .put(`/api/packages/${owner.pkg.id}`)
        .set(auth(admin))
        .send({ user_limit: value })
      expect(response.status).toBe(200)
      expect((await PackageModel.findByPk(owner.pkg.id)).user_limit).toBe(value)
    }
    for (const value of [-1, 1.5, 2147483648])
      expect(
        (
          await request(app)
            .put(`/api/packages/${owner.pkg.id}`)
            .set(auth(admin))
            .send({ user_limit: value })
        ).status
      ).toBe(400)
    expect(
      (
        await request(app)
          .put(`/api/packages/${owner.pkg.id}`)
          .set(auth(owner.token))
          .send({ user_limit: 100 })
      ).status
    ).toBe(403)
  })

  it('excludes the subscriber but counts both enabled and disabled staff', async () => {
    const owner = await fixture(2)
    expect((await allowance(owner)).body.data).toMatchObject({
      used: 0,
      limit: 2,
      can_create: true,
    })
    expect((await create(owner)).status).toBe(201)
    expect((await create(owner, { status: 0 })).status).toBe(201)
    expect((await allowance(owner)).body.data).toMatchObject({
      used: 2,
      remaining: 0,
      can_create: false,
    })
    const response = await create(owner)
    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('USER_LIMIT_REACHED')
  })

  it('blocks zero-user packages and allows unlimited staff when the limit is blank', async () => {
    const zero = await fixture(0)
    expect((await create(zero)).status).toBe(403)
    const unlimited = await fixture(null)
    for (let index = 0; index < 3; index++)
      expect((await create(unlimited)).status).toBe(201)
    expect((await allowance(unlimited)).body.data).toMatchObject({
      used: 3,
      limit: null,
      remaining: null,
      can_create: true,
    })
  })

  it('serializes concurrent requests so only the last available slot is used', async () => {
    const owner = await fixture(1)
    const results = await Promise.all([create(owner), create(owner)])
    expect(results.map((response) => response.status).sort()).toEqual([
      201, 403,
    ])
    expect(
      await UserModel.count({
        where: { parent_id: owner.user.id, user_type: 'staff' },
      })
    ).toBe(1)
  })

  it('shares the quota with staff delegates and admins adding users for this subscriber', async () => {
    const owner = await fixture(2)
    const first = await create(owner)
    const permissions = await PermissionModel.findAll({
      where: { key: ['user:write', 'user:read'] },
    })
    await UserPermissionModel.bulkCreate(
      permissions.map((p) => ({
        user_id: first.body.data.id,
        permission_id: p.id,
      }))
    )
    const staff = await UserModel.findByPk(first.body.data.id)
    const created = await create(
      { token: generateToken(staff) },
      { parent_id: 1 }
    )
    expect(created.status).toBe(201)
    expect(created.body.data.parent_id).toBe(owner.user.id)
    const blocked = await create({ token: admin }, { parent_id: owner.user.id })
    expect(blocked.status).toBe(403)
    expect(blocked.body.error.code).toBe('USER_LIMIT_REACHED')
  })

  it('keeps other subscriber usage private and does not mix quotas', async () => {
    const first = await fixture(1)
    const second = await fixture(1)
    expect((await create(first)).status).toBe(201)
    expect((await allowance(second)).body.data.used).toBe(0)
    expect(
      (
        await request(app)
          .get(`/api/users/allowance?parent_id=${first.user.id}`)
          .set(auth(second.token))
      ).status
    ).toBe(403)
    const adminView = await request(app)
      .get(`/api/users/allowance?parent_id=${first.user.id}`)
      .set(auth(admin))
    expect(adminView.body.data.used).toBe(1)
  })

  it('applies current package edits without removing users and ignores future renewal limits', async () => {
    const owner = await fixture(2)
    expect((await create(owner)).status).toBe(201)
    const future = await fixture(10)
    await SubscriptionModel.create({
      user_id: owner.user.id,
      package_id: future.pkg.id,
      kind: 'renewal',
      valid_from: dayjs().add(2, 'month').toDate(),
      valid_to: dayjs().add(3, 'month').toDate(),
    })
    await owner.pkg.update({ user_limit: 0 })
    expect((await allowance(owner)).body.data).toMatchObject({
      used: 1,
      limit: 0,
      can_create: false,
    })
    expect((await create(owner)).status).toBe(403)
    await owner.pkg.update({ user_limit: 2 })
    expect((await create(owner)).status).toBe(201)
  })

  it('requires an active subscription even when no explicit user limit is set', async () => {
    const owner = await fixture(null)
    await SubscriptionModel.update(
      { valid_to: dayjs().subtract(1, 'hour').toDate() },
      { where: { user_id: owner.user.id } }
    )
    await expect(
      userService.createStaff(
        {
          name: 'Expired Staff',
          username: `expired_${unique()}`,
          password: 'Test123!',
        },
        owner.user
      )
    ).rejects.toMatchObject({ code: 'SUBSCRIPTION_REQUIRED' })
  })
})
