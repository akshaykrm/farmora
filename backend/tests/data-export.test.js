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
import BatchModel from '@models/batch'
import SalesModel from '@models/sales'
import GeneralExpenseModel from '@models/generalexpense'
import ExpenseSalesModel from '@models/expensesales'
import InvestorManagementModel from '@models/investorManagement'
import ReferralPartnerModel from '@models/referralpartner'
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

const MENUS = [
  'sale',
  'sales_book',
  'general_expense',
  'general_sales',
  'cash_flow',
  'season_overview',
  'batch_overview',
  'investor',
  'investor_ledger',
  'item',
  'farm',
  'season',
  'batch',
  'vendor',
  'user',
]
const READ_KEYS = MENUS.map((menu) => `${menu}:read`)
const EXPORT_KEYS = MENUS.map((menu) => `${menu}:export`)

const loginAs = async (username, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
  expect(res.status).toBe(200)
  return res.body.data.token
}

const download = (path, query, token) =>
  request(app)
    .get(path)
    .query(query)
    .set(authHeader(token))
    .buffer(true)
    .parse(binaryParser)

const dataRowCount = async (buffer, sheetName, firstHeader) => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const sheet = workbook.getWorksheet(sheetName)
  expect(sheet, sheetName).toBeTruthy()
  let headerRow = null
  sheet.eachRow((row, index) => {
    if (headerRow === null && row.getCell(1).value === firstHeader) {
      headerRow = index
    }
  })
  expect(headerRow, sheetName).not.toBeNull()
  if (sheet.getRow(headerRow + 1).getCell(1).value === 'No records found') {
    return 0
  }
  return sheet.rowCount - headerRow
}

const createStaff = async (managerToken, keys) => {
  const permissions = await PermissionModel.findAll({
    where: { key: { [Op.in]: keys } },
  })
  const username = unique('dxstaff')
  const res = await request(app)
    .post('/api/users')
    .set(authHeader(managerToken))
    .send({
      name: 'Export Staff',
      username,
      password: 'root',
      permission_ids: permissions.map((p) => p.id),
    })
  expect(res.status).toBe(201)
  return loginAs(username, 'root')
}

describe('Data exports', () => {
  let role
  let pkg
  let manager
  let managerToken
  let readOnlyStaffToken
  let exportStaffToken
  let adminToken
  let partner
  let buyer
  let season
  let batch
  let endpoints

  beforeAll(async () => {
    await connectDB()

    role = await createSystemRoleWithKeys(unique('dxrole'), [
      ...READ_KEYS,
      ...EXPORT_KEYS,
      'user:write',
    ])
    pkg = await PackageModel.create({
      name: unique('dxpkg'),
      description: 'Data export test package',
      price: 1,
      actual_price: 1,
      duration: 1,
      status: 'active',
      role_id: role.id,
    })

    const username = unique('dxmgr')
    manager = await UserModel.create({
      name: 'Data Export Manager',
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
    managerToken = await loginAs(username, 'root')
    readOnlyStaffToken = await createStaff(managerToken, READ_KEYS)
    exportStaffToken = await createStaff(managerToken, [
      'batch:read',
      'batch:export',
      'investor:read',
      'investor:export',
    ])
    adminToken = await loginAs('superadmin', 'admin123')

    buyer = await VendorModel.create({
      master_id: manager.id,
      name: 'Export Buyer',
      vendor_type: 'customer',
      address: 'Test',
      opening_balance: 0,
    })
    const farm = await FarmModel.create({
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
    batch = await BatchModel.create({
      master_id: manager.id,
      name: 'Export Batch',
      season_id: season.id,
      farm_id: farm.id,
    })
    // Season overview only lists closed batches; the sales list only open ones.
    await BatchModel.create({
      master_id: manager.id,
      name: 'Export Closed Batch',
      season_id: season.id,
      farm_id: farm.id,
      closed_on: '2025-05-01',
    })
    await SalesModel.bulkCreate([
      {
        master_id: manager.id,
        season_id: season.id,
        batch_id: batch.id,
        buyer_id: buyer.id,
        date: '2025-02-10',
        weight: 100,
        bird_no: 50,
        price: 10,
        amount: 1000,
        payment_type: 'cash',
      },
      {
        master_id: manager.id,
        season_id: season.id,
        batch_id: batch.id,
        buyer_id: buyer.id,
        date: '2025-04-10',
        weight: 200,
        bird_no: 100,
        price: 10,
        amount: 2000,
        payment_type: 'credit',
      },
    ])
    await GeneralExpenseModel.bulkCreate([
      {
        master_id: manager.id,
        season_id: season.id,
        date: '2025-02-01',
        purpose: 'Electricity',
        amount: 300,
      },
      {
        master_id: manager.id,
        season_id: season.id,
        date: '2025-03-01',
        purpose: 'Water',
        amount: 150,
      },
    ])
    await ExpenseSalesModel.create({
      master_id: manager.id,
      season_id: season.id,
      date: '2025-03-05',
      purpose: 'Manure sale',
      amount: 80,
    })
    await InvestorManagementModel.create({
      master_id: manager.id,
      investor_name: 'Export Investor',
      investor_phone: `9${Date.now()}`.slice(0, 10),
    })

    partner = await ReferralPartnerModel.create({
      name: unique('dxpartner'),
      code: unique('DX').toUpperCase().slice(0, 20),
      status: 'active',
    })

    endpoints = [
      { path: '/api/sales/export', query: {} },
      { path: '/api/sales/ledger/export', query: { buyer_id: buyer.id } },
      { path: '/api/general-expenses/export', query: {} },
      { path: '/api/general-sales/export', query: {} },
      { path: '/api/balance-sheet/export', query: {} },
      { path: '/api/overview/season/export', query: { season_id: season.id } },
      { path: '/api/overview/batch/export', query: { batch_id: batch.id } },
      { path: '/api/investors/export', query: {} },
      { path: '/api/investors/ledger/export', query: { category: 'CAPITAL' } },
      { path: '/api/items/categories/export', query: {} },
      { path: '/api/farms/export', query: {} },
      { path: '/api/seasons/export', query: {} },
      { path: '/api/batches/export', query: {} },
      { path: '/api/vendors/export', query: {} },
      { path: '/api/users/export', query: {} },
    ]
  })

  afterAll(async () => {
    if (partner) {
      await ReferralPartnerModel.destroy({ where: { id: partner.id } })
    }
    if (manager) {
      const masterScope = { where: { master_id: manager.id }, force: true }
      await SalesModel.destroy(masterScope)
      await GeneralExpenseModel.destroy(masterScope)
      await ExpenseSalesModel.destroy(masterScope)
      await InvestorManagementModel.destroy(masterScope)
      await BatchModel.destroy(masterScope)
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

  it('denies tenant exports to users with read but without export permission', async () => {
    for (const { path, query } of endpoints) {
      const res = await request(app)
        .get(path)
        .query({ ...query, format: 'xlsx' })
        .set(authHeader(readOnlyStaffToken))
      expect(res.status, path).toBe(403)
    }
  })

  it('returns xlsx and pdf files for every tenant export', async () => {
    for (const { path, query } of endpoints) {
      const xlsx = await download(
        path,
        { ...query, format: 'xlsx' },
        managerToken
      )
      expect(xlsx.status, path).toBe(200)
      expect(xlsx.headers['content-type']).toContain(XLSX_TYPE)
      expect(xlsx.headers['content-disposition']).toMatch(
        /attachment; filename=".+\.xlsx"/
      )

      const pdf = await download(
        path,
        { ...query, format: 'pdf' },
        managerToken
      )
      expect(pdf.status, path).toBe(200)
      expect(pdf.headers['content-type']).toContain('application/pdf')
      expect(pdf.body.subarray(0, 4).toString()).toBe('%PDF')
    }
  })

  it('applies list filters to the exported rows', async () => {
    const allSales = await download(
      '/api/sales/export',
      { format: 'xlsx' },
      managerToken
    )
    expect(await dataRowCount(allSales.body, 'Sales', 'Date')).toBe(2)

    const allExpenses = await download(
      '/api/general-expenses/export',
      { format: 'xlsx' },
      managerToken
    )
    expect(
      await dataRowCount(allExpenses.body, 'General Expense', 'Date')
    ).toBe(2)

    const fullSeason = await download(
      '/api/overview/season/export',
      { season_id: season.id, format: 'xlsx', gc_limit: 1 },
      managerToken
    )
    expect(await dataRowCount(fullSeason.body, 'Batch Overview', 'Batch')).toBe(
      1
    )
    expect(await dataRowCount(fullSeason.body, 'General Cost', 'Date')).toBe(2)
    expect(await dataRowCount(fullSeason.body, 'General Sales', 'Date')).toBe(1)

    const sales = await download(
      '/api/sales/export',
      { start_date: '2025-04-01', end_date: '2025-04-30', format: 'xlsx' },
      managerToken
    )
    expect(await dataRowCount(sales.body, 'Sales', 'Date')).toBe(1)

    const expenses = await download(
      '/api/general-expenses/export',
      { purpose: 'Wat', format: 'xlsx' },
      managerToken
    )
    expect(await dataRowCount(expenses.body, 'General Expense', 'Date')).toBe(1)

    const seasonOverview = await download(
      '/api/overview/season/export',
      { season_id: season.id, gc_purpose: 'electric', format: 'xlsx' },
      managerToken
    )
    expect(
      await dataRowCount(seasonOverview.body, 'General Cost', 'Date')
    ).toBe(1)

    const batchOverview = await download(
      '/api/overview/batch/export',
      { batch_id: batch.id, format: 'xlsx', s_limit: 1 },
      managerToken
    )
    expect(await dataRowCount(batchOverview.body, 'Sales', 'Date')).toBe(2)
  })

  it('scopes staff exports to their company', async () => {
    const batches = await download(
      '/api/batches/export',
      { format: 'xlsx' },
      exportStaffToken
    )
    expect(batches.status).toBe(200)
    expect(await dataRowCount(batches.body, 'Batches', 'Name')).toBe(2)

    const investors = await download(
      '/api/investors/export',
      { format: 'xlsx' },
      exportStaffToken
    )
    expect(investors.status).toBe(200)
    expect(await dataRowCount(investors.body, 'Investors', 'Name')).toBe(1)
  })

  it('requires the required filter for book and overview exports', async () => {
    for (const path of [
      '/api/sales/ledger/export',
      '/api/overview/season/export',
      '/api/overview/batch/export',
    ]) {
      const res = await request(app)
        .get(path)
        .query({ format: 'pdf' })
        .set(authHeader(managerToken))
      expect(res.status, path).toBe(400)
    }
  })

  it('serves platform exports to super admin only', async () => {
    const platformEndpoints = [
      '/api/users/subscribers/export',
      '/api/packages/export',
      '/api/referrals/export',
      `/api/referrals/${partner.id}/ledger/export`,
    ]

    for (const path of platformEndpoints) {
      const denied = await request(app)
        .get(path)
        .query({ format: 'xlsx' })
        .set(authHeader(managerToken))
      expect(denied.status, path).toBe(403)

      const xlsx = await download(path, { format: 'xlsx' }, adminToken)
      expect(xlsx.status, path).toBe(200)
      expect(xlsx.headers['content-type']).toContain(XLSX_TYPE)

      const pdf = await download(path, { format: 'pdf' }, adminToken)
      expect(pdf.status, path).toBe(200)
      expect(pdf.body.subarray(0, 4).toString()).toBe('%PDF')
    }

    const unauthenticated = await request(app)
      .get('/api/packages/export')
      .query({ format: 'xlsx' })
    expect(unauthenticated.status).toBe(401)
  })
})
