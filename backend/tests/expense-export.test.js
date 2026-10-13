import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { Op } from 'sequelize'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import RoleModel from '@models/role'
import RolePermissionModel from '@models/rolepermission'
import UserPermissionModel from '@models/userpermission'
import PermissionModel from '@models/permission'
import VendorModel from '@models/vendor'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import WorkingCostModel from '@models/workingcost'
import PurchaseBookModel from '@models/purchasebook'
import { connectDB } from '@utils/db'
import { createSystemRoleWithKeys } from './helpers/entitlements.js'

const unique = (prefix) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

const binaryParser = (res, callback) => {
  const chunks = []
  res.on('data', (chunk) => chunks.push(chunk))
  res.on('end', () => callback(null, Buffer.concat(chunks)))
}

const XLSX_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const READ_KEYS = [
  'purchase:read',
  'item_return:read',
  'purchase_book:read',
  'integration_book:read',
  'working_cost:read',
]
const EXPORT_KEYS = READ_KEYS.map((key) => key.replace(':read', ':export'))

const loginAs = async (username, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
  expect(res.status).toBe(200)
  return res.body.data
}

const dataRowCount = async (buffer, sheetName) => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const sheet = workbook.getWorksheet(sheetName)
  expect(sheet).toBeTruthy()
  let headerRow = null
  sheet.eachRow((row, index) => {
    if (headerRow === null && row.getCell(1).value === 'Date') headerRow = index
  })
  expect(headerRow).not.toBeNull()
  if (sheet.getRow(headerRow + 1).getCell(1).value === 'No records found') {
    return 0
  }
  return sheet.rowCount - headerRow
}

describe('Expense exports', () => {
  let role
  let pkg
  let manager
  let managerToken
  let staffToken
  let vendor
  let farm
  let season
  let endpoints

  beforeAll(async () => {
    await connectDB()

    role = await createSystemRoleWithKeys(unique('exportrole'), [
      ...READ_KEYS,
      ...EXPORT_KEYS,
      'user:read',
      'user:write',
    ])
    pkg = await PackageModel.create({
      name: unique('exportpkg'),
      description: 'Export test package',
      price: 1,
      actual_price: 1,
      duration: 1,
      status: 'active',
      role_id: role.id,
    })

    const username = unique('exportmgr')
    manager = await UserModel.create({
      name: 'Export Manager',
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
      package_id: pkg.id,
      valid_from: dayjs().subtract(1, 'day').toDate(),
      valid_to: dayjs().add(1, 'year').toDate(),
    })
    managerToken = (await loginAs(username, 'root')).token

    const readPermissions = await PermissionModel.findAll({
      where: { key: { [Op.in]: READ_KEYS } },
    })
    const staffUsername = unique('exportstaff')
    const staff = await request(app)
      .post('/api/users')
      .set(authHeader(managerToken))
      .send({
        name: 'Export Staff',
        username: staffUsername,
        password: 'root',
        permission_ids: readPermissions.map((p) => p.id),
      })
    expect(staff.status).toBe(201)
    staffToken = (await loginAs(staffUsername, 'root')).token

    vendor = await VendorModel.create({
      master_id: manager.id,
      name: 'Export Vendor',
      vendor_type: 'supplier',
      address: 'Test',
      opening_balance: 100,
    })
    farm = await FarmModel.create({
      master_id: manager.id,
      name: 'Export Farm',
      place: 'Test',
      capacity: 1,
    })
    season = await SeasonModel.create({
      master_id: manager.id,
      name: 'Export Season',
      status: 'active',
      from_date: '2025-01-01',
      to_date: '2025-12-31',
    })

    await WorkingCostModel.bulkCreate([
      {
        master_id: manager.id,
        season_id: season.id,
        date: '2025-01-10',
        purpose: 'January expense',
        amount: 100,
        payment_type: 'expense',
      },
      {
        master_id: manager.id,
        season_id: season.id,
        date: '2025-03-10',
        purpose: 'March expense',
        amount: 200,
        payment_type: 'expense',
      },
    ])
    await PurchaseBookModel.bulkCreate([
      {
        master_id: manager.id,
        vendor_id: vendor.id,
        amount: 50,
        date: '2025-01-15',
      },
      {
        master_id: manager.id,
        vendor_id: vendor.id,
        amount: 70,
        date: '2025-03-15',
      },
    ])

    endpoints = [
      { path: '/api/purchases/export', query: {} },
      { path: '/api/item-returns/export', query: {} },
      {
        path: '/api/items/purchase-book/export',
        query: { vendor_id: vendor.id },
      },
      {
        path: '/api/purchases/purchase-book/export',
        query: { vendor_id: vendor.id },
      },
      {
        path: '/api/integration-book/export',
        query: {
          farm_id: farm.id,
          start_date: '2025-01-01',
          end_date: '2025-12-31',
        },
      },
      { path: '/api/working-costs/export', query: { season_id: season.id } },
    ]
  })

  afterAll(async () => {
    if (manager) {
      const masterScope = { where: { master_id: manager.id }, force: true }
      await WorkingCostModel.destroy(masterScope)
      await PurchaseBookModel.destroy(masterScope)
      await VendorModel.destroy(masterScope)
      await FarmModel.destroy(masterScope)
      await SeasonModel.destroy(masterScope)

      const staff = await UserModel.findAll({
        where: { parent_id: manager.id },
      })
      const staffIds = staff.map((user) => user.id)
      if (staffIds.length) {
        await UserPermissionModel.destroy({ where: { user_id: staffIds } })
        await UserModel.destroy({ where: { id: staffIds }, force: true })
      }
      await SubscriptionModel.destroy({
        where: { user_id: manager.id },
        force: true,
      })
      await UserModel.destroy({ where: { id: manager.id }, force: true })
    }
    if (pkg) {
      await PackageModel.destroy({ where: { id: pkg.id }, force: true })
    }
    if (role) {
      await RolePermissionModel.destroy({ where: { role_id: role.id } })
      await RoleModel.destroy({ where: { id: role.id }, force: true })
    }
  })

  it('denies export to users with read but without export permission', async () => {
    for (const { path, query } of endpoints) {
      const res = await request(app)
        .get(path)
        .query({ ...query, format: 'xlsx' })
        .set(authHeader(staffToken))
      expect(res.status, path).toBe(403)
    }
  })

  it('returns xlsx and pdf files to users with export permission', async () => {
    for (const { path, query } of endpoints) {
      const xlsx = await request(app)
        .get(path)
        .query({ ...query, format: 'xlsx' })
        .set(authHeader(managerToken))
        .buffer(true)
        .parse(binaryParser)
      expect(xlsx.status, path).toBe(200)
      expect(xlsx.headers['content-type']).toContain(XLSX_TYPE)
      expect(xlsx.headers['content-disposition']).toMatch(
        /attachment; filename=".+\.xlsx"/
      )

      const pdf = await request(app)
        .get(path)
        .query({ ...query, format: 'pdf' })
        .set(authHeader(managerToken))
        .buffer(true)
        .parse(binaryParser)
      expect(pdf.status, path).toBe(200)
      expect(pdf.headers['content-type']).toContain('application/pdf')
      expect(pdf.body.subarray(0, 4).toString()).toBe('%PDF')
    }
  })

  it('applies the date filter to working cost exports', async () => {
    const all = await request(app)
      .get('/api/working-costs/export')
      .query({ season_id: season.id, format: 'xlsx' })
      .set(authHeader(managerToken))
      .buffer(true)
      .parse(binaryParser)
    expect(await dataRowCount(all.body, 'Expense')).toBe(2)

    const filtered = await request(app)
      .get('/api/working-costs/export')
      .query({
        season_id: season.id,
        start_date: '2025-03-01',
        end_date: '2025-03-31',
        format: 'xlsx',
      })
      .set(authHeader(managerToken))
      .buffer(true)
      .parse(binaryParser)
    expect(await dataRowCount(filtered.body, 'Expense')).toBe(1)
  })

  it('applies the date filter to purchase book exports', async () => {
    const filtered = await request(app)
      .get('/api/items/purchase-book/export')
      .query({
        vendor_id: vendor.id,
        start_date: '2025-03-01',
        end_date: '2025-03-31',
        format: 'xlsx',
      })
      .set(authHeader(managerToken))
      .buffer(true)
      .parse(binaryParser)
    expect(filtered.status).toBe(200)
    expect(await dataRowCount(filtered.body, 'Purchase Book')).toBe(1)
  })

  it('rejects missing or invalid format and missing required filters', async () => {
    const missing = await request(app)
      .get('/api/purchases/export')
      .set(authHeader(managerToken))
    expect(missing.status).toBe(400)

    const invalid = await request(app)
      .get('/api/purchases/export')
      .query({ format: 'csv' })
      .set(authHeader(managerToken))
    expect(invalid.status).toBe(400)

    const noVendor = await request(app)
      .get('/api/items/purchase-book/export')
      .query({ format: 'pdf' })
      .set(authHeader(managerToken))
    expect(noVendor.status).toBe(400)
  })
})
