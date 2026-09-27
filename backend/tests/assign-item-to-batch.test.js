import { beforeAll, describe, expect, it } from 'vitest'
import { createVendor } from './helpers/vendor'
import { createBatch } from './helpers/batch'
import { createItemCategory } from './helpers/item-category'
import {
  assignItemToBatch,
  createItem,
  getItemById,
  reassignItemToBatch,
} from './helpers/item'
import { createSeason } from './helpers/season'
import { connectDB } from '#utils/db'
import { createFarm } from './helpers/farm'

import '../models/index.js'
import { login } from './helpers/login.js'
import { grantAllTenantPermissionsToPackage } from './helpers/entitlements.js'
import PackageModel from '@models/package'
import { Op } from 'sequelize'

function randomCase() {
  const totalItemQty = Math.floor(Math.random() * 5000) + 500
  const creatingAssignQty = Math.floor(Math.random() * 50) + 1
  const assignQty = Math.floor(Math.random() * 200) + 10
  const reassignQty = Math.floor(Math.random() * assignQty)
  return { totalItemQty, creatingAssignQty, assignQty, reassignQty }
}

const cases = Array.from({ length: 300 }, randomCase)
console.log(cases)

describe('Assign Item to Batch Workflow', () => {
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

  it.each(cases)(
    'runs workflow with %#',
    async ({ assignQty, creatingAssignQty, reassignQty, totalItemQty }) => {
      const token = await login()
      const vendor = await createVendor(token)
      const itemCategory = await createItemCategory(token)
      const farm = await createFarm(token)
      const season = await createSeason(token)
      const batch = await createBatch(token, {
        farm_id: farm.id,
        season_id: season.id,
      })

      const item = await createItem(token, {
        name: 'Chicks',
        total_price: 1300,
        quantity: totalItemQty,
        price_per_unit: 1.3,
        assign_quantity: creatingAssignQty,
        category_id: itemCategory.id,
        batch_id: batch.id,
        vendor_id: vendor.id,
      })

      expect(item.quantity).toBe(totalItemQty - creatingAssignQty)

      const data = await assignItemToBatch(token, {
        quantity: assignQty,
        batch_id: batch.id,
        item_id: item.id,
      })
      expect(data.quantity).toBe(creatingAssignQty + assignQty)

      const secondBatch = await createBatch(token, {
        name: 'mate farm',
        farm_id: farm.id,
        season_id: season.id,
      })

      const reassigned = await reassignItemToBatch(token, {
        item_id: item.id,
        source_batch_id: batch.id,
        target_batch_id: secondBatch.id,
        quantity: reassignQty,
      })

      expect(reassigned.quantity).toBe(
        creatingAssignQty + assignQty - reassignQty
      )

      const updatedItem = await getItemById(token, item.id)
      expect(updatedItem.quantity).toBe(
        totalItemQty - creatingAssignQty - assignQty
      )
    }
  )
})
