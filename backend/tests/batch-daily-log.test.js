import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import app from '../app.js'
import '../models/index.js'
import UserModel from '@models/user'
import SubscriptionModel from '@models/subscription'
import PackageModel from '@models/package'
import RoleModel from '@models/role'
import RolePermissionModel from '@models/rolepermission'
import VendorModel from '@models/vendor'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import BatchModel from '@models/batch'
import BatchDailyLogModel from '@models/batchdailylog'
import PurchaseModel from '@models/purchase'
import ItemModel from '@models/items.model'
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

const KEYS = [
  'batch_daily_log:read',
  'batch_daily_log:write',
  'batch_daily_log:edit',
  'batch_daily_log:delete',
  'batch_daily_log:export',
]

const loginAs = async (username, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
  expect(res.status).toBe(200)
  return res.body.data.token
}

const createManager = async (pkg) => {
  const username = unique('dailylogmgr')
  const manager = await UserModel.create({
    name: 'Daily Log Manager',
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
  return { manager, token: await loginAs(username, 'root') }
}

const createBatchFor = async (managerId) => {
  const farm = await FarmModel.create({
    master_id: managerId,
    name: 'Daily Log Farm',
    place: 'Koorotupara',
    capacity: 5000,
  })
  const season = await SeasonModel.create({
    master_id: managerId,
    name: 'Daily Log Season',
    status: 'active',
    from_date: '2025-01-01',
    to_date: '2025-12-31',
  })
  return BatchModel.create({
    master_id: managerId,
    farm_id: farm.id,
    season_id: season.id,
    name: 'Daily Log Batch',
    status: 'active',
  })
}

describe('Batch daily log', () => {
  let role
  let pkg
  let owner
  let other
  let batch
  let base

  const api = (method, path, token = owner.token) =>
    request(app)[method](`${base}${path}`).set(authHeader(token))

  beforeAll(async () => {
    await connectDB()
    role = await createSystemRoleWithKeys(unique('dailylogrole'), KEYS)
    pkg = await PackageModel.create({
      name: unique('dailylogpkg'),
      description: 'Daily log test package',
      price: 1,
      actual_price: 1,
      duration: 1,
      status: 'active',
      role_id: role.id,
    })
    owner = await createManager(pkg)
    other = await createManager(pkg)
    batch = await createBatchFor(owner.manager.id)
    const masterId = owner.manager.id
    const [comarla, venkys] = await VendorModel.bulkCreate(
      ['COMARLA', 'VENKYS'].map((name) => ({
        master_id: masterId,
        name,
        vendor_type: 'supplier',
        address: 'Test',
        opening_balance: 0,
      }))
    )
    const item = (name, type, vendorId) =>
      ItemModel.create({ master_id: masterId, name, type, vendor_id: vendorId })
    const comarlaChick = await item('Comarla Chick', 'chick', comarla.id)
    const venkysChick = await item('Venkys Chick', 'chick', venkys.id)
    const starter = await item('Starter Feed', 'STARTER', comarla.id)

    const purchase = (category, vendorId, quantity, date) =>
      PurchaseModel.create({
        master_id: masterId,
        name: 'test',
        category_id: category.id,
        quantity,
        total_price: 0,
        net_amount: 0,
        price_per_unit: 0,
        invoice_number: unique('inv'),
        invoice_date: dayjs(date).toDate(),
        vendor_id: vendorId,
        season_id: batch.season_id,
        farm_id: batch.farm_id,
        batch_id: batch.id,
      })
    await purchase(comarlaChick, comarla.id, 3000, '2025-09-21')
    await purchase(venkysChick, venkys.id, 876, '2025-09-23')
    await purchase(starter, comarla.id, 5, '2025-09-25')

    base = `/api/batches/${batch.id}/daily-logs`
  })

  afterAll(async () => {
    for (const { manager } of [owner, other].filter(Boolean)) {
      const masterScope = { where: { master_id: manager.id }, force: true }
      await BatchDailyLogModel.destroy({ where: { master_id: manager.id } })
      await PurchaseModel.destroy(masterScope)
      await ItemModel.destroy(masterScope)
      await BatchModel.destroy(masterScope)
      await VendorModel.destroy(masterScope)
      await FarmModel.destroy(masterScope)
      await SeasonModel.destroy(masterScope)
      await SubscriptionModel.destroy({
        where: { user_id: manager.id },
        force: true,
      })
      await UserModel.destroy({ where: { id: manager.id }, force: true })
    }
    if (pkg) await PackageModel.destroy({ where: { id: pkg.id }, force: true })
    if (role) {
      await RolePermissionModel.destroy({ where: { role_id: role.id } })
      await RoleModel.destroy({ where: { id: role.id }, force: true })
    }
  })

  it('takes chicks qty and companies from chick purchases', async () => {
    const res = await api('get', '/')
    expect(res.status).toBe(200)
    expect(res.body.data.header.total_chicks).toBe(3876)
    expect(res.body.data.header.companies).toEqual(['COMARLA', 'VENKYS'])
    expect(res.body.data.header.suggested_start_date).toBe('2025-09-21')
    expect(res.body.data.header.log_start_date).toBeNull()
  })

  it('requires a start date before logs can be added', async () => {
    const res = await api('post', '/').send({ date: '2025-09-21' })
    expect(res.status).toBe(400)

    const future = await api('put', '/start-date').send({
      log_start_date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    })
    expect(future.status).toBe(400)

    const set = await api('put', '/start-date').send({
      log_start_date: '2025-09-21',
    })
    expect(set.status).toBe(200)
  })

  it('computes age, cumulative mortality, consumption and stock like the sheet', async () => {
    const entries = [
      { date: '2025-09-21', mortality: 1, issued_feed: 10, consumed_feed: 1 },
      { date: '2025-09-22', mortality: 5, consumed_feed: 2 },
      { date: '2025-09-23', mortality: 7, consumed_feed: 1 },
    ]
    for (const entry of entries) {
      const res = await api('post', '/').send(entry)
      expect(res.status).toBe(201)
    }

    const { body } = await api('get', '/')
    const rows = body.data.logs
    expect(rows.map((row) => row.age)).toEqual([0, 1, 2])
    expect(rows.map((row) => row.cum_mortality)).toEqual([1, 6, 13])
    expect(rows.map((row) => row.total_consumption)).toEqual([1, 3, 4])
    expect(rows.map((row) => row.feed_stock)).toEqual([9, 7, 6])
    expect(rows[1].birds_alive).toBe(3000 - 6)
    expect(rows[2].birds_alive).toBe(3876 - 13)
    expect(body.data.summary.birds_alive).toBe(3876 - 13)
    expect(body.data.summary.feed_stock).toBe(6)
  })

  it('recalculates later rows when an earlier day is edited', async () => {
    const { body } = await api('get', '/')
    const day1 = body.data.logs[1]
    const res = await api('put', `/${day1.id}`).send({ mortality: 2 })
    expect(res.status).toBe(200)

    const after = await api('get', '/')
    expect(after.body.data.logs.map((row) => row.cum_mortality)).toEqual([
      1, 3, 10,
    ])
  })

  it('rejects duplicate, early and future dates', async () => {
    const duplicate = await api('post', '/').send({ date: '2025-09-22' })
    expect(duplicate.status).toBe(409)

    const early = await api('post', '/').send({ date: '2025-09-20' })
    expect(early.status).toBe(400)

    const future = await api('post', '/').send({
      date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    })
    expect(future.status).toBe(400)
  })

  it('guards start date changes against existing logs', async () => {
    const later = await api('put', '/start-date').send({
      log_start_date: '2025-09-22',
    })
    expect(later.status).toBe(400)

    const earlier = await api('put', '/start-date').send({
      log_start_date: '2025-09-20',
    })
    expect(earlier.status).toBe(200)
    const { body } = await api('get', '/')
    expect(body.data.logs[0].age).toBe(1)

    await api('put', '/start-date').send({ log_start_date: '2025-09-21' })
  })

  it('prefills the age and feed purchased for a date', async () => {
    const res = await api('get', '/prefill').query({ date: '2025-09-25' })
    expect(res.status).toBe(200)
    expect(res.body.data.age).toBe(4)
    expect(res.body.data.issued_feed).toBe(5)

    const noFeed = await api('get', '/prefill').query({ date: '2025-09-24' })
    expect(noFeed.body.data.issued_feed).toBe(0)
  })

  it('deletes a log', async () => {
    const created = await api('post', '/').send({
      date: '2025-09-24',
      mortality: 4,
    })
    expect(created.status).toBe(201)
    const removed = await api('delete', `/${created.body.data.id}`)
    expect(removed.status).toBe(200)
    const { body } = await api('get', '/')
    expect(body.data.logs).toHaveLength(3)
  })

  it('exports the log as xlsx and pdf', async () => {
    const xlsx = await api('get', '/export')
      .query({ format: 'xlsx' })
      .buffer(true)
      .parse(binaryParser)
    expect(xlsx.status).toBe(200)
    expect(xlsx.headers['content-type']).toContain(XLSX_TYPE)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(xlsx.body)
    expect(workbook.worksheets.length).toBeGreaterThan(0)

    const pdf = await api('get', '/export')
      .query({ format: 'pdf' })
      .buffer(true)
      .parse(binaryParser)
    expect(pdf.status).toBe(200)
    expect(pdf.headers['content-type']).toContain('application/pdf')
  })

  it('hides the batch from other tenants', async () => {
    const res = await api('get', '/', other.token)
    expect(res.status).toBe(404)
    const write = await api('post', '/', other.token).send({
      date: '2025-09-25',
    })
    expect(write.status).toBe(404)
  })

  it('blocks changes once the batch is closed', async () => {
    await batch.update({ closed_on: new Date() })
    const res = await api('post', '/').send({ date: '2025-09-25' })
    expect(res.status).toBe(400)
    const startDate = await api('put', '/start-date').send({
      log_start_date: '2025-09-20',
    })
    expect(startDate.status).toBe(400)
    const read = await api('get', '/')
    expect(read.status).toBe(200)
  })
})
