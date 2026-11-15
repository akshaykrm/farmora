import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../app'
import { connectDB } from '@utils/db'
import PackageModel from '@models/package'
import { Op } from 'sequelize'
import { login } from './helpers/login.js'
import { grantAllTenantPermissionsToPackage } from './helpers/entitlements.js'
import { createVendor } from './helpers/vendor'
import { createBatch } from './helpers/batch'
import { createItemCategory } from './helpers/item-category'
import { WorkflowError } from './helpers/error'
import { createSeason } from './helpers/season'
import { createFarm } from './helpers/farm'
import '../models/index.js'

describe('Incomplete invoices', () => {
  let token = ''

  beforeAll(async () => {
    connectDB()
    const activePackage =
      (await PackageModel.findOne({
        where: { status: 'active', name: 'Basic' },
      })) ||
      (await PackageModel.findOne({
        where: { status: 'active', role_id: { [Op.ne]: null } },
      }))
    if (activePackage) {
      await grantAllTenantPermissionsToPackage(activePackage.id)
    }
    token = await login()
  })

  it('blocks batch close until the incomplete purchase is completed', async () => {
    const vendor = await createVendor(token)
    const category = await createItemCategory(token)
    const farm = await createFarm(token)
    const season = await createSeason(token)
    const batch = await createBatch(token, {
      farm_id: farm.id,
      season_id: season.id,
    })

    const createRes = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Chicks',
        total_price: 1000,
        quantity: 100,
        price_per_unit: 10,
        assign_quantity: 0,
        category_id: category.id,
        batch_id: batch.id,
        vendor_id: vendor.id,
        season_id: season.id,
        net_amount: 1000,
        invoice_number: `INC-${Date.now()}`,
        invoice_date: new Date().toISOString(),
        payment_type: 'credit',
        is_incomplete: true,
      })
    if (createRes.status !== 201) throw new WorkflowError(createRes)
    const item = createRes.body.data

    const auth = { Authorization: `Bearer ${token}` }

    const pending = await request(app)
      .get(`/api/dashboard/pending-invoices?batch_id=${batch.id}`)
      .set(auth)
    expect(pending.status).toBe(200)
    expect(pending.body.data.purchases).toBe(1)
    expect(pending.body.data.items[0].id).toBe(item.id)

    const blocked = await request(app)
      .put(`/api/batches/${batch.id}/close`)
      .set(auth)
      .send({})
    expect(blocked.status).toBe(409)
    expect(blocked.body.error.code).toBe('INCOMPLETE_INVOICES')

    const seasonBlocked = await request(app)
      .put(`/api/seasons/${season.id}/close`)
      .set(auth)
    expect(seasonBlocked.status).toBe(409)

    const done = await request(app)
      .put(`/api/purchases/${item.id}`)
      .set(auth)
      .send({ is_incomplete: false })
    expect(done.status).toBe(200)

    const closed = await request(app)
      .put(`/api/batches/${batch.id}/close`)
      .set(auth)
      .send({})
    expect(closed.status).toBe(200)
  })
})
