import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { approveSignup } from './helpers/approval.js'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import { sequelize } from '@utils/db'
import PackageModel from '@models/package'
import UserModel from '@models/user'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import SubscriptionModel from '@models/subscription'
import PermissionModel from '@models/permission'
import UserPermissionModel from '@models/userpermission'
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

describe('Package farm allowance', () => {
  it('allows Super Admin to save and edit the farm limit and rejects invalid values', async () => {
    const created = await request(app)
      .post('/api/packages')
      .set(auth(adminToken))
      .send({
        name: `Quota package ${unique()}`,
        description: 'Configurable allowance',
        actual_price: 0,
        discount_price: 0,
        duration: 1,
        role_id: role.id,
        farm_limit: 2,
      })
    expect(created.status).toBe(200)
    expect(created.body.data.farm_limit).toBe(2)
    const id = created.body.data.id
    for (const value of [-1, 1.5, 2147483648]) {
      expect(
        (
          await request(app)
            .put(`/api/packages/${id}`)
            .set(auth(adminToken))
            .send({ farm_limit: value })
        ).status
      ).toBe(400)
    }
    const edited = await request(app)
      .put(`/api/packages/${id}`)
      .set(auth(adminToken))
      .send({ farm_limit: null })
    expect(edited.status).toBe(200)
    expect((await PackageModel.findByPk(id)).farm_limit).toBeNull()
  })
  it('blocks creation at the package limit, counting all farms independently of page filters', async () => {
    const user = await tenant(1)
    expect((await createFarm(user, 'Existing Farm')).status).toBe(201)
    const filtered = await request(app)
      .get('/api/farms?name=nomatch&page=1&limit=1')
      .set(auth(user.token))
    expect(filtered.body.data.data).toHaveLength(0)
    const quota = await allowance(user)
    expect(quota.status).toBe(200)
    expect(quota.body.data).toMatchObject({
      limit: 1,
      used: 1,
      remaining: 0,
      can_create: false,
    })
    const blocked = await createFarm(user)
    expect(blocked.status).toBe(403)
    expect(blocked.body.error.code).toBe('FARM_LIMIT_REACHED')
    expect(await FarmModel.count({ where: { master_id: user.id } })).toBe(1)
  })
  it('serializes concurrent creation so only one request can use the final slot', async () => {
    const user = await tenant(1)
    const responses = await Promise.all([
      createFarm(user),
      createFarm(user),
      createFarm(user),
    ])
    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 403, 403,
    ])
    expect(await FarmModel.count({ where: { master_id: user.id } })).toBe(1)
  })
  it('shares one allowance between manager and staff', async () => {
    const user = await tenant(1)
    const username = `staff_${unique()}`
    const staff = await UserModel.create({
      name: 'Quota Staff',
      username,
      password: 'FarmLimit123!',
      user_type: 'staff',
      parent_id: user.id,
      status: 1,
    })
    const permissions = await PermissionModel.findAll({
      where: { key: ['farm:read', 'farm:write'] },
    })
    await UserPermissionModel.bulkCreate(
      permissions.map((permission) => ({
        user_id: staff.id,
        permission_id: permission.id,
      }))
    )
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username, password: 'FarmLimit123!' })
    expect(login.status).toBe(200)
    const staffSession = { token: login.body.data.token }
    expect((await createFarm(staffSession)).status).toBe(201)
    expect((await allowance(staffSession)).body.data.used).toBe(1)
    expect((await createFarm(user)).status).toBe(403)
  })
  it('keeps tenants separate and never lets a manager edit another tenant farm', async () => {
    const first = await tenant(1)
    const second = await tenant(1)
    const firstFarm = await createFarm(first)
    expect((await createFarm(second)).status).toBe(201)
    expect((await allowance(second)).body.data.used).toBe(1)
    const edit = await request(app)
      .put(`/api/farms/${firstFarm.body.data.id}`)
      .set(auth(second.token))
      .send({ name: 'Not yours' })
    expect(edit.status).toBe(404)
    expect((await FarmModel.findByPk(firstFarm.body.data.id)).name).not.toBe(
      'Not yours'
    )
  })
  it('counts inactive farms and preserves existing farms after a limit reduction', async () => {
    const user = await tenant(2)
    const first = await createFarm(user)
    expect((await createFarm(user)).status).toBe(201)
    await FarmModel.update(
      { status: 'inactive' },
      { where: { id: first.body.data.id } }
    )
    await user.packageRecord.update({ farm_limit: 1 })
    expect((await allowance(user)).body.data).toMatchObject({
      used: 2,
      limit: 1,
      can_create: false,
    })
    expect((await createFarm(user)).status).toBe(403)
    const edit = await request(app)
      .put(`/api/farms/${first.body.data.id}`)
      .set(auth(user.token))
      .send({ name: 'Updated existing farm' })
    expect(edit.status).toBe(200)
    expect(await FarmModel.count({ where: { master_id: user.id } })).toBe(2)
    await user.packageRecord.update({ farm_limit: 3 })
    expect((await createFarm(user)).status).toBe(201)
  })
  it('does not apply a future renewal allowance before the current package expires', async () => {
    const user = await tenant(1)
    const future = await plan(5)
    await SubscriptionModel.create({
      user_id: user.id,
      package_id: future.id,
      kind: 'renewal',
      valid_from: dayjs().add(1, 'month').toDate(),
      valid_to: dayjs().add(2, 'month').toDate(),
    })
    expect((await allowance(user)).body.data.limit).toBe(1)
  })
  it('allows unlimited packages and restores a slot when a farm is deleted', async () => {
    const unlimited = await tenant(null)
    for (let index = 0; index < 3; index += 1)
      expect((await createFarm(unlimited)).status).toBe(201)
    expect((await allowance(unlimited)).body.data).toMatchObject({
      used: 3,
      limit: null,
      remaining: null,
      can_create: true,
    })
    const limited = await tenant(1)
    const farm = await createFarm(limited)
    expect(
      (
        await request(app)
          .delete(`/api/farms/${farm.body.data.id}`)
          .set(auth(limited.token))
      ).status
    ).toBe(200)
    expect((await createFarm(limited)).status).toBe(201)
  })
  it('enforces a zero-farm package inside automatic setup and rolls back generated data', async () => {
    const user = await tenant(0)
    const generated = await request(app)
      .post('/api/setup/generate')
      .set(auth(user.token))
    expect(generated.status).toBe(403)
    expect(generated.body.error.code).toBe('FARM_LIMIT_REACHED')
    expect(await FarmModel.count({ where: { master_id: user.id } })).toBe(0)
    expect(await SeasonModel.count({ where: { master_id: user.id } })).toBe(0)
    expect((await createFarm(user)).status).toBe(403)
  })
  it('counts the setup farm and does not duplicate it under concurrent setup requests', async () => {
    const user = await tenant(1)
    const responses = await Promise.all([
      request(app).post('/api/setup/generate').set(auth(user.token)),
      request(app).post('/api/setup/generate').set(auth(user.token)),
    ])
    for (const response of responses) expect(response.status).toBe(200)
    expect(await FarmModel.count({ where: { master_id: user.id } })).toBe(1)
    expect((await createFarm(user)).status).toBe(403)
  })
  it('requires an active subscription and prevents subscribers changing their limits', async () => {
    const user = await tenant(1)
    expect(
      (
        await request(app)
          .put(`/api/packages/${user.packageRecord.id}`)
          .set(auth(user.token))
          .send({ farm_limit: 100 })
      ).status
    ).toBe(403)
    await SubscriptionModel.update(
      { valid_to: dayjs().subtract(1, 'day').toDate() },
      { where: { user_id: user.id } }
    )
    const quota = await farmService.getAllowance(user)
    expect(quota.can_create).toBe(false)
    await expect(
      farmService.create({ name: 'Expired farm' }, user)
    ).rejects.toMatchObject({ code: 'SUBSCRIPTION_REQUIRED' })
  })
})
