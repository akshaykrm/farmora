import dayjs from 'dayjs'
import CONFIG from '../config.js'
import { sequelize } from '../src/utils/db.js'
import {
  UserModel,
  PackageModel,
  SubscriptionModel,
  FarmModel,
  SeasonModel,
  BatchModel,
  VendorModel,
  ItemModel,
  PurchaseModel,
  PurchaseBatchAssignmentModel,
  SalesModel,
  BatchDailyLogModel,
  RoleModel,
  RolePermissionModel,
  UserRoleAssignment,
} from '../models/index.js'
import InvoiceConfig from '../models/invoice_config.js'
import { SYSTEM_ITEMS } from '../src/services/items.service.js'

// This opt-in fixture must never run against a shared or production database.
if (
  CONFIG.nodeEnv !== 'development' ||
  CONFIG.db_name !== 'farmora_local' ||
  !['127.0.0.1', 'localhost'].includes(CONFIG.db_host)
) {
  throw new Error('Demo seed requires development and localhost DB_NAME=farmora_local')
}

try {
  await sequelize.transaction(async (transaction) => {
    const options = { transaction }
    const existing = await UserModel.findOne({
      where: { username: 'demo_manager' },
      ...options,
    })
    if (existing) {
      console.log('Demo data already exists; no records changed.')
      return
    }
    const admin = await UserModel.findOne({
      where: { username: 'superadmin' },
      ...options,
    })
    const plan = await PackageModel.findOne({
      where: { name: 'Basic' },
      ...options,
    })
    if (!admin || !plan?.role_id) {
      throw new Error('Run migrations and bun run db:seed before seed:demo')
    }

    const today = dayjs().startOf('day')
    const manager = await UserModel.create({
      name: 'Demo Poultry Farms', username: 'demo_manager',
      email: 'manager@example.test', phone: '9000000001',
      password: 'DemoFarm123!', user_type: 'manager', parent_id: admin.id,
      status: 1, state: 'Kerala', district: 'Palakkad', place: 'Ottapalam',
      pincode: '679101', bird_capacity: '4000',
    }, options)
    const master_id = manager.id
    const staff = await UserModel.create({
      name: 'Demo Farm Staff', username: 'demo_staff',
      email: 'staff@example.test', password: 'DemoFarm123!',
      user_type: 'staff', parent_id: master_id, status: 1,
    }, options)
    await SubscriptionModel.create({
      user_id: master_id, package_id: plan.id,
      valid_from: today.subtract(60, 'day').toDate(),
      valid_to: today.add(1, 'year').toDate(), kind: 'initial',
    }, options)
    await InvoiceConfig.create({
      name: manager.name, number: 100, parent_id: master_id,
    }, options)
    const role = await RoleModel.create({
      manager_id: master_id, name: 'Demo Operations',
      description: 'Local demo staff access within the Basic package.',
      kind: 'custom',
    }, options)
    const permissions = await RolePermissionModel.findAll({
      where: { role_id: plan.role_id }, ...options,
    })
    await RolePermissionModel.bulkCreate(permissions.map((row) => ({
      role_id: role.id, permission_id: row.permission_id,
    })), options)
    await UserRoleAssignment.create({ user_id: staff.id, role_id: role.id }, options)

    const season = await SeasonModel.create({
      master_id, name: `Demo Season ${today.year()}`,
      from_date: today.subtract(60, 'day').toDate(),
      to_date: today.add(6, 'month').toDate(), status: 'active',
    }, options)
    const supplier = await VendorModel.create({
      master_id, name: 'Demo Hatchery & Feed', vendor_type: 'supplier',
      address: 'Palakkad, Kerala', opening_balance: 0,
    }, options)
    const buyer = await VendorModel.create({
      master_id, name: 'Demo Poultry Market', vendor_type: 'customer',
      address: 'Ottapalam, Kerala', opening_balance: 0,
    }, options)
    const internal = await VendorModel.create({
      master_id, name: 'Internal', vendor_type: 'internal', opening_balance: 0,
      address: '-',
    }, options)
    await ItemModel.bulkCreate(SYSTEM_ITEMS.map((item) => ({
      ...item, master_id, vendor_id: internal.id,
    })), options)
    const chicks = await ItemModel.create({
      master_id, name: 'Demo Broiler Chicks', type: 'chick',
      vendor_id: supplier.id, base_price: 40,
    }, options)
    const feed = await ItemModel.create({
      master_id, name: 'Demo Starter Feed (50 kg)', type: 'STARTER',
      vendor_id: supplier.id, base_price: 1800,
    }, options)
    for (let index = 0; index < 2; index += 1) {
      const farm = await FarmModel.create({
        master_id, name: `Demo Farm ${index + 1}`, place: 'Ottapalam',
        capacity: '2000', own: index === 0,
      }, options)
      const start = today.subtract(index === 0 ? 13 : 6, 'day')
      const batch = await BatchModel.create({
        master_id, season_id: season.id, farm_id: farm.id,
        name: `Demo Broiler Batch ${index + 1}`,
        log_start_date: start.format('YYYY-MM-DD'),
      }, options)
      for (const [item, quantity, rate] of [[chicks, 1000, 40], [feed, 40, 1800]]) {
        const purchase = await PurchaseModel.create({
          master_id, season_id: season.id, farm_id: farm.id, batch_id: batch.id,
          category_id: item.id, vendor_id: supplier.id, name: item.name,
          quantity, total_price: quantity * rate, net_amount: quantity * rate,
          invoice_number: `DEMO-${index + 1}-${item.type}`,
          invoice_date: start.toDate(), price_per_unit: rate, discount_price: 0,
          payment_type: 'credit',
        }, options)
        await PurchaseBatchAssignmentModel.create({
          purchase_id: purchase.id, batch_id: batch.id, quantity,
        }, options)
      }
      for (let date = start; !date.isAfter(today); date = date.add(1, 'day')) {
        await BatchDailyLogModel.create({
          master_id, batch_id: batch.id, date: date.format('YYYY-MM-DD'),
          mortality: 1, issued_feed: date.isSame(start) ? 40 : 0,
          consumed_feed: 1.6, avg_body_weight: 0.05 + date.diff(start, 'day') * 0.04,
          created_by: staff.id, remarks: 'Local demo daily observation',
        }, options)
      }
    }
    // A separate mature batch makes sales and financial reports useful.
    const farm = await FarmModel.findOne({ where: { master_id }, ...options })
    const mature = await BatchModel.create({
      master_id, season_id: season.id, farm_id: farm.id,
      name: 'Demo Completed Batch', status: 'inactive',
      log_start_date: today.subtract(50, 'day').format('YYYY-MM-DD'),
      closed_on: today.subtract(8, 'day').toDate(),
    }, options)
    for (const [item, quantity, rate] of [[chicks, 500, 40], [feed, 35, 1800]]) {
      const purchase = await PurchaseModel.create({
        master_id, season_id: season.id, farm_id: farm.id, batch_id: mature.id,
        category_id: item.id, vendor_id: supplier.id, name: item.name,
        quantity, total_price: quantity * rate, net_amount: quantity * rate,
        invoice_number: `DEMO-CLOSED-${item.type}`,
        invoice_date: today.subtract(50, 'day').toDate(), price_per_unit: rate,
        payment_type: 'paid',
      }, options)
      await PurchaseBatchAssignmentModel.create({
        purchase_id: purchase.id, batch_id: mature.id, quantity,
      }, options)
    }
    await SalesModel.create({
      master_id, season_id: season.id, batch_id: mature.id,
      buyer_id: buyer.id, date: today.subtract(8, 'day').toDate(),
      bird_no: 490, weight: 980, avg_weight: 2, price: 120,
      amount: 117600, payment_type: 'cash', narration: 'Demo completed flock sale',
    }, options)
    await BatchDailyLogModel.create({
      master_id, batch_id: mature.id,
      date: today.subtract(8, 'day').format('YYYY-MM-DD'),
      mortality: 10, issued_feed: 35, consumed_feed: 35,
      sold_birds: 490, sold_weight: 980, avg_body_weight: 2,
      created_by: staff.id, remarks: 'Demo final flock summary',
    }, options)
    console.log('Demo created: manager, staff, subscription, role, 2 farms, 3 batches, 5 items, 6 purchases, sale, 22 daily logs.')
  })
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await sequelize.close()
}
