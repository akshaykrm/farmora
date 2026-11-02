import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import batchService from '@services/batch.service'
import PackageModel from '@models/package'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import BatchModel from '@models/batch'
import PermissionModel from '@models/permission'
import UserPermissionModel from '@models/userpermission'
import { generateToken } from '@utils/jwt'
import { createSystemRoleWithKeys } from './helpers/entitlements.js'

let role
let admin
const unique = () => randomUUID().replaceAll('-', '')
const auth = (token) => ({ Authorization: `Bearer ${token}` })
const tenant = async (limit, parents = true) => {
  const pkg = await PackageModel.create({
    name: `Batch limit ${unique()}`,
    description: 'Quota test',
    actual_price: 0,
    discount_price: 0,
    duration: 1,
    status: 'active',
    role_id: role.id,
    batch_limit: limit,
    farm_limit: 0,
  })
  const user = await UserModel.create({
    name: 'Batch Tester',
    username: `batch_${unique()}`,
    password: 'Test123!',
    user_type: 'manager',
    status: 1,
    parent_id: 1,
  })
  await SubscriptionModel.create({
    user_id: user.id,
    package_id: pkg.id,
    valid_from: dayjs().subtract(1, 'day').toDate(),
    valid_to: dayjs().add(1, 'month').toDate(),
  })
  const token = generateToken(user)
  const farm = parents
    ? await FarmModel.create({
        master_id: user.id,
        name: 'Farm',
        own: true,
        status: 'active',
      })
    : null
  const season = parents
    ? await SeasonModel.create({
        master_id: user.id,
        name: 'Season',
        from_date: dayjs().startOf('year').toDate(),
        to_date: dayjs().endOf('year').toDate(),
        status: 'active',
      })
    : null
  return { user, pkg, token, farm, season }
}
const create = (owner, extra = {}) =>
  request(app)
    .post('/api/batches')
    .set(auth(owner.token))
    .send({
      name: `Batch ${unique()}`,
      farm_id: owner.farm.id,
      season_id: owner.season.id,
      status: 'active',
      ...extra,
    })
const allowance = (owner) =>
  request(app).get('/api/batches/allowance').set(auth(owner.token))

beforeAll(async () => {
  if (!process.env.DB_NAME?.endsWith('_test'))
    throw new Error('Use an isolated *_test database')
  role = await createSystemRoleWithKeys(`Batch limit role ${unique()}`, [
    'farm:read',
    'farm:write',
    'farm:edit',
    'batch:read',
    'batch:write',
    'batch:edit',
    'batch:delete',
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

describe('Package total batch limits', () => {
  it('saves batch limits, supports unlimited and zero, rejects invalid values and subscriber edits', async () => {
    const t = await tenant(1)
    for (const value of [0, 5, null]) {
      expect(
        (
          await request(app)
            .put(`/api/packages/${t.pkg.id}`)
            .set(auth(admin))
            .send({ batch_limit: value })
        ).status
      ).toBe(200)
      expect((await PackageModel.findByPk(t.pkg.id)).batch_limit).toBe(value)
    }
    for (const value of [-1, 1.5, 2147483648])
      expect(
        (
          await request(app)
            .put(`/api/packages/${t.pkg.id}`)
            .set(auth(admin))
            .send({ batch_limit: value })
        ).status
      ).toBe(400)
    expect(
      (
        await request(app)
          .put(`/api/packages/${t.pkg.id}`)
          .set(auth(t.token))
          .send({ batch_limit: 100 })
      ).status
    ).toBe(403)
  })

  it('counts all batches across farms including closed and inactive batches', async () => {
    const t = await tenant(2)
    const first = await create(t)
    expect(first.status).toBe(201)
    expect(
      (
        await request(app)
          .put(`/api/batches/${first.body.data.id}/close`)
          .set(auth(t.token))
      ).status
    ).toBe(200)
    const otherFarm = await FarmModel.create({
      master_id: t.user.id,
      name: 'Second farm',
      own: true,
      status: 'active',
    })
    expect(
      (await create(t, { farm_id: otherFarm.id, status: 'inactive' })).status
    ).toBe(201)
    const quota = await allowance(t)
    expect(quota.body.data).toMatchObject({
      used: 2,
      limit: 2,
      can_create: false,
    })
    const blocked = await create(t)
    expect(blocked.status).toBe(403)
    expect(blocked.body.error.code).toBe('BATCH_LIMIT_REACHED')
  })

  it('serializes simultaneous requests at the last slot', async () => {
    const t = await tenant(1)
    const responses = await Promise.all([create(t), create(t)])
    expect(responses.map((r) => r.status).sort()).toEqual([201, 403])
    expect(await BatchModel.count({ where: { master_id: t.user.id } })).toBe(1)
  })

  it('shares owner quota with staff and stores staff-created batches under the owner', async () => {
    const t = await tenant(1)
    const staff = await UserModel.create({
      name: 'Staff',
      username: `staff_${unique()}`,
      password: 'Test123!',
      user_type: 'staff',
      status: 1,
      parent_id: t.user.id,
    })
    const permissions = await PermissionModel.findAll({
      where: { key: ['batch:read', 'batch:write'] },
    })
    await UserPermissionModel.bulkCreate(
      permissions.map((p) => ({ user_id: staff.id, permission_id: p.id }))
    )
    const response = await create({ ...t, token: generateToken(staff) })
    expect(response.status, JSON.stringify(response.body)).toBe(201)
    expect(response.body.data.master_id).toBe(t.user.id)
    expect((await create(t)).status).toBe(403)
  })

  it('enforces zero quota during setup and rolls back generated data', async () => {
    const t = await tenant(0, false)
    const response = await request(app)
      .post('/api/setup/generate')
      .set(auth(t.token))
    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('BATCH_LIMIT_REACHED')
    expect(await FarmModel.count({ where: { master_id: t.user.id } })).toBe(0)
    expect(await SeasonModel.count({ where: { master_id: t.user.id } })).toBe(0)
  })

  it('counts the setup batch and keeps concurrent setup idempotent', async () => {
    const t = await tenant(1, false)
    const responses = await Promise.all([
      request(app).post('/api/setup/generate').set(auth(t.token)),
      request(app).post('/api/setup/generate').set(auth(t.token)),
    ])
    expect(responses.map((r) => r.status)).toEqual([200, 200])
    expect(await BatchModel.count({ where: { master_id: t.user.id } })).toBe(1)
    expect((await allowance(t)).body.data.can_create).toBe(false)
  })

  it('supports unlimited plans and applies changed limits without deleting batches', async () => {
    const t = await tenant(null)
    for (let i = 0; i < 3; i++) expect((await create(t)).status).toBe(201)
    expect((await allowance(t)).body.data.limit).toBeNull()
    await t.pkg.update({ batch_limit: 1 })
    expect((await create(t)).status).toBe(403)
    expect(await BatchModel.count({ where: { master_id: t.user.id } })).toBe(3)
    await t.pkg.update({ batch_limit: 4 })
    expect((await create(t)).status).toBe(201)
  })

  it('uses the current package rather than a future renewal and requires active subscription', async () => {
    const t = await tenant(0)
    const future = await tenant(10)
    await SubscriptionModel.create({
      user_id: t.user.id,
      package_id: future.pkg.id,
      kind: 'renewal',
      valid_from: dayjs().add(2, 'month').toDate(),
      valid_to: dayjs().add(3, 'month').toDate(),
    })
    expect((await allowance(t)).body.data.limit).toBe(0)
    await SubscriptionModel.update(
      { valid_to: dayjs().subtract(1, 'hour').toDate() },
      { where: { user_id: t.user.id, package_id: t.pkg.id } }
    )
    const response = await create(t)
    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('PERMISSION_DENIED')
    await expect(
      batchService.create(
        {
          name: 'Expired batch',
          farm_id: t.farm.id,
          season_id: t.season.id,
          status: 'active',
        },
        t.user
      )
    ).rejects.toMatchObject({ code: 'SUBSCRIPTION_REQUIRED' })
  })

  it('rejects foreign farms and seasons without consuming quota', async () => {
    const t = await tenant(1)
    const other = await tenant(1)
    expect((await create(t, { farm_id: other.farm.id })).status).toBe(404)
    expect((await create(t, { season_id: other.season.id })).status).toBe(404)
    expect((await allowance(t)).body.data.used).toBe(0)
  })
})
