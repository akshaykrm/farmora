import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PermissionModel from '@models/permission'
import { connectDB } from '@utils/db'

const unique = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

const loginAs = async (username, password) => {
  const res = await request(app).post('/api/auth/login').send({
    username,
    password,
  })
  expect(res.status).toBe(200)
  return res.body.data
}

const createManager = async (overrides = {}) => {
  const username = overrides.username || unique('mgr')
  const manager = await UserModel.create({
    name: overrides.name || 'Test Manager',
    username,
    email: `${username}@farmora.test`,
    phone: '9999999999',
    password: 'root',
    user_type: 'manager',
    status: 1,
    parent_id: 1,
  })

  await SubscriptionModel.create({
    user_id: manager.id,
    package_id: 1,
    valid_from: dayjs().subtract(1, 'day').toDate(),
    valid_to: dayjs().add(1, 'year').toDate(),
  })

  return manager
}

const permissionIdByKey = async (key) => {
  const record = await PermissionModel.findOne({ where: { key } })
  expect(record).toBeTruthy()
  return record.id
}

describe('Roles and permissions', () => {
  let admin
  let managerA
  let managerB
  let managerAToken
  let managerBToken
  let seasonReadId
  let seasonWriteId
  let packageReadId

  beforeAll(async () => {
    await connectDB()
    admin = await loginAs('superadmin', 'admin123')
    managerA = await createManager()
    managerB = await createManager()
    managerAToken = (await loginAs(managerA.username, 'root')).token
    managerBToken = (await loginAs(managerB.username, 'root')).token
    seasonReadId = await permissionIdByKey('season:read')
    seasonWriteId = await permissionIdByKey('season:write')
    packageReadId = await permissionIdByKey('package:read')
  })

  it('returns permissions on login for super admin', () => {
    expect(admin.user_type).toBe('admin')
    expect(admin.permissions).toContain('package:read')
    expect(admin.permissions).toContain('season:read')
  })

  it('lets a subscriber access tenant APIs and denies platform APIs', async () => {
    const seasons = await request(app)
      .get('/api/seasons')
      .set(authHeader(managerAToken))
    expect(seasons.status).toBe(200)

    const subscriptions = await request(app)
      .get('/api/subscriptions')
      .set(authHeader(managerAToken))
    expect(subscriptions.status).toBe(403)
  })

  it('lets super admin access platform APIs', async () => {
    const subscriptions = await request(app)
      .get('/api/subscriptions')
      .set(authHeader(admin.token))
    expect(subscriptions.status).toBe(200)
  })

  it('returns 403 when staff has no grant', async () => {
    const username = unique('staff')
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(managerAToken))
      .send({
        name: 'Staff None',
        username,
        password: 'root',
      })
    expect(created.status).toBe(201)

    const staffSession = await loginAs(username, 'root')
    expect(staffSession.permissions).toEqual([])
    expect(staffSession.master_id).toBe(managerA.id)

    const seasons = await request(app)
      .get('/api/seasons')
      .set(authHeader(staffSession.token))
    expect(seasons.status).toBe(403)
  })

  it('allows staff with a grant and scopes data to the parent subscriber', async () => {
    const username = unique('staff')
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(managerAToken))
      .send({
        name: 'Staff Reader',
        username,
        password: 'root',
        permission_ids: [seasonReadId],
      })
    expect(created.status).toBe(201)
    expect(created.body.data.permission_ids).toContain(seasonReadId)

    const staffSession = await loginAs(username, 'root')
    expect(staffSession.permissions).toContain('season:read')
    expect(staffSession.permissions).not.toContain('season:write')

    const list = await request(app)
      .get('/api/seasons')
      .set(authHeader(staffSession.token))
    expect(list.status).toBe(200)

    const write = await request(app)
      .post('/api/seasons')
      .set(authHeader(staffSession.token))
      .send({
        name: 'Forbidden season',
        status: 'active',
        from_date: dayjs().toISOString(),
        to_date: dayjs().add(1, 'month').toISOString(),
      })
    expect(write.status).toBe(403)
  })

  it('prevents subscriber A from reading subscriber B users', async () => {
    const username = unique('staffb')
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(managerBToken))
      .send({
        name: 'Staff B',
        username,
        password: 'root',
      })
    expect(created.status).toBe(201)
    const staffBId = created.body.data.id

    const fromA = await request(app)
      .get(`/api/users/${staffBId}`)
      .set(authHeader(managerAToken))
    expect(fromA.status).toBe(404)

    const listA = await request(app)
      .get('/api/users')
      .set(authHeader(managerAToken))
    expect(listA.status).toBe(200)
    const ids = (listA.body.data.data || []).map((user) => user.id)
    expect(ids).not.toContain(staffBId)
  })

  it('rejects assigning platform permissions to staff', async () => {
    const username = unique('staff')
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(managerAToken))
      .send({
        name: 'Staff Platform',
        username,
        password: 'root',
        permission_ids: [packageReadId],
      })
    expect(created.status).toBe(403)
  })

  it('lets a subscriber create a role and assign it to staff', async () => {
    const roleRes = await request(app)
      .post('/api/roles')
      .set(authHeader(managerAToken))
      .send({
        name: unique('role'),
        description: 'Season writer',
        permission_ids: [seasonReadId, seasonWriteId],
      })
    expect(roleRes.status).toBe(201)

    const username = unique('staff')
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(managerAToken))
      .send({
        name: 'Staff Role',
        username,
        password: 'root',
        role_ids: [roleRes.body.data.id],
      })
    expect(created.status).toBe(201)

    const staffSession = await loginAs(username, 'root')
    expect(staffSession.permissions).toEqual(
      expect.arrayContaining(['season:read', 'season:write'])
    )
  })

  it('lets super admin list subscribers', async () => {
    const res = await request(app)
      .get('/api/users')
      .query({ user_type: 'manager', limit: 50 })
      .set(authHeader(admin.token))
    expect(res.status).toBe(200)
    const usernames = (res.body.data.data || []).map((user) => user.username)
    expect(usernames).toEqual(
      expect.arrayContaining([managerA.username, managerB.username])
    )
  })

  it('lets a subscriber change password for their user only', async () => {
    const username = unique('staffpw')
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(managerAToken))
      .send({
        name: 'Staff Password',
        username,
        password: 'root',
      })
    expect(created.status).toBe(201)
    const staffId = created.body.data.id

    const changed = await request(app)
      .put(`/api/users/${staffId}/password`)
      .set(authHeader(managerAToken))
      .send({ new_password: 'newpass' })
    expect(changed.status).toBe(200)

    const loginNew = await request(app).post('/api/auth/login').send({
      username,
      password: 'newpass',
    })
    expect(loginNew.status).toBe(200)

    const loginOld = await request(app).post('/api/auth/login').send({
      username,
      password: 'root',
    })
    expect(loginOld.status).toBe(401)

    const otherStaff = await request(app)
      .post('/api/users')
      .set(authHeader(managerBToken))
      .send({
        name: 'Staff B Password',
        username: unique('staffbwpw'),
        password: 'root',
      })
    expect(otherStaff.status).toBe(201)

    const crossTenant = await request(app)
      .put(`/api/users/${otherStaff.body.data.id}/password`)
      .set(authHeader(managerAToken))
      .send({ new_password: 'hacked' })
    expect(crossTenant.status).toBe(404)
  })
})
