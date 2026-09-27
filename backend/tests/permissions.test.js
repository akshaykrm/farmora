import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import PermissionModel from '@models/permission'
import UserPermissionModel from '@models/userpermission'
import { connectDB } from '@utils/db'
import {
  createSystemRoleWithKeys,
  grantAllTenantPermissionsToPackage,
} from './helpers/entitlements.js'

const unique = (prefix) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

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
    package_id: overrides.package_id || 1,
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
  let basicPackageId

  beforeAll(async () => {
    await connectDB()
    const basicPackage = await PackageModel.findOne({ where: { name: 'Basic' } })
    expect(basicPackage).toBeTruthy()
    basicPackageId = basicPackage.id
    await grantAllTenantPermissionsToPackage(basicPackageId)

    admin = await loginAs('superadmin', 'admin123')
    managerA = await createManager({ package_id: basicPackageId })
    managerB = await createManager({ package_id: basicPackageId })
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

  it('lets admin create a system role and attach it to a package', async () => {
    const roleRes = await request(app)
      .post('/api/roles')
      .set(authHeader(admin.token))
      .send({
        name: unique('sysrole'),
        description: 'Package ceiling',
        kind: 'system',
        permission_ids: [seasonReadId],
      })
    expect(roleRes.status).toBe(201)
    expect(roleRes.body.data.kind).toBe('system')
    expect(roleRes.body.data.manager_id).toBeNull()

    const pkg = await PackageModel.create({
      name: unique('pkg'),
      description: 'Test package',
      price: 10,
      duration: 1,
      status: 'active',
      role_id: roleRes.body.data.id,
    })

    const fetched = await request(app)
      .get(`/api/packages/${pkg.id}`)
      .set(authHeader(admin.token))
    expect(fetched.status).toBe(200)
    expect(fetched.body.data.role_id).toBe(roleRes.body.data.id)
    expect(fetched.body.data.role.name).toBe(roleRes.body.data.name)
  })

  it('caps manager access to the package system role', async () => {
    const limitedRole = await createSystemRoleWithKeys(unique('limited'), [
      'dashboard:read',
      'season:read',
    ])
    const limitedPackage = await PackageModel.create({
      name: unique('limitedpkg'),
      description: 'Limited',
      price: 1,
      duration: 1,
      status: 'active',
      role_id: limitedRole.id,
    })
    const manager = await createManager({ package_id: limitedPackage.id })
    const session = await loginAs(manager.username, 'root')
    expect(session.permissions).toEqual(
      expect.arrayContaining(['dashboard:read', 'season:read'])
    )
    expect(session.permissions).not.toContain('season:write')

    const seasons = await request(app)
      .get('/api/seasons')
      .set(authHeader(session.token))
    expect(seasons.status).toBe(200)

    const write = await request(app)
      .post('/api/seasons')
      .set(authHeader(session.token))
      .send({
        name: unique('season'),
        status: 'active',
        from_date: dayjs().toISOString(),
        to_date: dayjs().add(1, 'month').toISOString(),
      })
    expect(write.status).toBe(403)
  })

  it('ignores staff grants outside the current package and restores on upgrade', async () => {
    const premiumKeys = [
      'dashboard:read',
      'user:read',
      'user:write',
      'user:edit',
      'role:read',
      'role:write',
      'season:read',
      'season:write',
    ]
    const basicKeys = [
      'dashboard:read',
      'user:read',
      'user:write',
      'user:edit',
      'role:read',
      'role:write',
      'season:read',
    ]

    const premiumRole = await createSystemRoleWithKeys(
      unique('premiumceil'),
      premiumKeys
    )
    const basicRole = await createSystemRoleWithKeys(
      unique('basicceil'),
      basicKeys
    )
    const premiumPackage = await PackageModel.create({
      name: unique('premiumpkg'),
      description: 'Premium ceiling',
      price: 100,
      duration: 1,
      status: 'active',
      role_id: premiumRole.id,
    })
    const basicPackage = await PackageModel.create({
      name: unique('basicpkg'),
      description: 'Basic ceiling',
      price: 50,
      duration: 1,
      status: 'active',
      role_id: basicRole.id,
    })

    const manager = await createManager({ package_id: premiumPackage.id })
    const managerToken = (await loginAs(manager.username, 'root')).token

    const username = unique('staffceil')
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(managerToken))
      .send({
        name: 'Staff Ceiling',
        username,
        password: 'root',
        permission_ids: [seasonReadId, seasonWriteId],
      })
    expect(created.status).toBe(201)

    const staffUserId = created.body.data.id
    let staffSession = await loginAs(username, 'root')
    expect(staffSession.permissions).toEqual(
      expect.arrayContaining(['season:read', 'season:write'])
    )

    await SubscriptionModel.update(
      { valid_to: dayjs().subtract(1, 'minute').toDate() },
      { where: { user_id: manager.id } }
    )
    await SubscriptionModel.create({
      user_id: manager.id,
      package_id: basicPackage.id,
      kind: 'renewal',
      valid_from: dayjs().toDate(),
      valid_to: dayjs().add(1, 'year').toDate(),
    })

    staffSession = await loginAs(username, 'root')
    expect(staffSession.permissions).toContain('season:read')
    expect(staffSession.permissions).not.toContain('season:write')

    const writeDenied = await request(app)
      .post('/api/seasons')
      .set(authHeader(staffSession.token))
      .send({
        name: unique('season'),
        status: 'active',
        from_date: dayjs().toISOString(),
        to_date: dayjs().add(1, 'month').toISOString(),
      })
    expect(writeDenied.status).toBe(403)

    const stored = await UserPermissionModel.findAll({
      where: { user_id: staffUserId },
    })
    expect(stored.map((row) => row.permission_id).sort()).toEqual(
      [seasonReadId, seasonWriteId].sort()
    )

    await SubscriptionModel.update(
      { valid_to: dayjs().subtract(1, 'minute').toDate() },
      { where: { user_id: manager.id } }
    )
    await SubscriptionModel.create({
      user_id: manager.id,
      package_id: premiumPackage.id,
      kind: 'renewal',
      valid_from: dayjs().toDate(),
      valid_to: dayjs().add(2, 'year').toDate(),
    })

    staffSession = await loginAs(username, 'root')
    expect(staffSession.permissions).toEqual(
      expect.arrayContaining(['season:read', 'season:write'])
    )
  })

  it('rejects assigning permissions outside the company package', async () => {
    const limitedRole = await createSystemRoleWithKeys(unique('assigncap'), [
      'dashboard:read',
      'user:read',
      'user:write',
      'user:edit',
      'season:read',
    ])
    const limitedPackage = await PackageModel.create({
      name: unique('assignpkg'),
      description: 'Assign cap',
      price: 1,
      duration: 1,
      status: 'active',
      role_id: limitedRole.id,
    })
    const manager = await createManager({ package_id: limitedPackage.id })
    const managerToken = (await loginAs(manager.username, 'root')).token

    const roleRes = await request(app)
      .post('/api/roles')
      .set(authHeader(managerToken))
      .send({
        name: unique('badrole'),
        description: 'Too many perms',
        permission_ids: [seasonReadId, seasonWriteId],
      })
    expect(roleRes.status).toBe(403)

    const staffRes = await request(app)
      .post('/api/users')
      .set(authHeader(managerToken))
      .send({
        name: 'Staff Over',
        username: unique('staffover'),
        password: 'root',
        permission_ids: [seasonWriteId],
      })
    expect(staffRes.status).toBe(403)
  })
})
