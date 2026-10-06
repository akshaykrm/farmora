import dayjs from 'dayjs'
import FarmModel from '@models/farm'
import SeasonModel from '@models/season'
import BatchModel from '@models/batch'
import VendorModel from '@models/vendor'
import UserModel from '@models/user'
import ItemModel from '@models/items.model'
import { sequelize } from '@utils/db'
import { tenantMasterId } from '@utils/tenant-scope'
import {
  SYSTEM_ITEMS,
  SYSTEM_ITEM_TYPES,
  findOrCreateInternalVendor,
} from '@services/items.service'
import { VendorNotFoundError } from '@errors/vendor.errors'
import { Op } from 'sequelize'

const PROFILE_FIELDS = [
  'state',
  'district',
  'place',
  'pincode',
  'bird_capacity',
]

const isFilled = (value) =>
  value !== null && value !== undefined && String(value).trim() !== ''

const buildDefaults = (user) => {
  const ownerName = (user.name || '').trim()
  const farmName = ownerName ? `${ownerName} Farm` : 'My Farm'
  const today = dayjs()

  return {
    farm: {
      name: farmName,
      place: user.place || '',
      capacity: user.bird_capacity || '',
    },
    season: {
      name: `Season ${today.year()}`,
      from_date: today.format('YYYY-MM-DD'),
      to_date: today.add(1, 'year').format('YYYY-MM-DD'),
    },
    batch: {
      name: 'Batch 1',
    },
    supplier: {
      name: 'General Supplier',
      address: '-',
      opening_balance: '0.00',
    },
    customer: {
      name: 'Walk-in Customer',
      address: '-',
      opening_balance: '0.00',
    },
    items: SYSTEM_ITEMS,
  }
}

const findFirst = (Model, where, transaction) =>
  Model.findOne({ where, order: [['id', 'ASC']], transaction })

const findSystemItems = async (masterId, transaction) => {
  const rows = await ItemModel.findAll({
    where: { master_id: masterId, type: { [Op.in]: SYSTEM_ITEM_TYPES } },
    order: [['id', 'ASC']],
    transaction,
  })
  const byType = new Map()
  for (const row of rows) {
    if (!byType.has(row.type)) byType.set(row.type, row)
  }
  return byType
}

const getStatus = async (currentUser) => {
  const masterId = tenantMasterId(currentUser)
  const owner = (await UserModel.findByPk(masterId)) || currentUser

  const [farm, season, batch, supplier, customer, systemByType] =
    await Promise.all([
      findFirst(FarmModel, { master_id: masterId }),
      findFirst(SeasonModel, { master_id: masterId }),
      findFirst(BatchModel, { master_id: masterId }),
      findFirst(VendorModel, { master_id: masterId, vendor_type: 'supplier' }),
      findFirst(VendorModel, { master_id: masterId, vendor_type: 'customer' }),
      findSystemItems(masterId),
    ])

  const systemItems = SYSTEM_ITEMS.map((definition) => {
    const row = systemByType.get(definition.type)
    return row
      ? {
          type: definition.type,
          id: row.id,
          name: row.name,
          base_price: row.base_price,
          exists: true,
        }
      : { ...definition, id: null, exists: false }
  })

  const items = {
    profile: PROFILE_FIELDS.every((field) => isFilled(owner[field])),
    farm: Boolean(farm),
    season: Boolean(season),
    batch: Boolean(batch),
    suppliers: Boolean(supplier),
    customers: Boolean(customer),
    items: systemItems.every((item) => item.exists),
  }

  return {
    items,
    completed: Object.values(items).every(Boolean),
    existing: {
      farm: farm ? { id: farm.id, name: farm.name } : null,
      season: season ? { id: season.id, name: season.name } : null,
      supplier: supplier ? { id: supplier.id, name: supplier.name } : null,
    },
    systemItems,
    profile: Object.fromEntries(
      PROFILE_FIELDS.map((field) => [field, owner[field] ?? ''])
    ),
    defaults: buildDefaults(owner),
  }
}

const generateDefaults = async (currentUser) => {
  const masterId = tenantMasterId(currentUser)
  const owner = (await UserModel.findByPk(masterId)) || currentUser
  const defaults = buildDefaults(owner)
  const created = {}

  await sequelize.transaction(async (transaction) => {
    let farm = await findFirst(FarmModel, { master_id: masterId }, transaction)
    if (!farm) {
      farm = await FarmModel.create(
        { ...defaults.farm, master_id: masterId, own: true, status: 'active' },
        { transaction }
      )
      created.farm = farm
    }

    let season = await findFirst(
      SeasonModel,
      { master_id: masterId },
      transaction
    )
    if (!season) {
      season = await SeasonModel.create(
        { ...defaults.season, master_id: masterId, status: 'active' },
        { transaction }
      )
      created.season = season
    }

    const batch = await findFirst(
      BatchModel,
      { master_id: masterId },
      transaction
    )
    if (!batch) {
      created.batch = await BatchModel.create(
        {
          ...defaults.batch,
          master_id: masterId,
          farm_id: farm.id,
          season_id: season.id,
          status: 'active',
        },
        { transaction }
      )
    }

    for (const type of ['supplier', 'customer']) {
      const vendor = await findFirst(
        VendorModel,
        { master_id: masterId, vendor_type: type },
        transaction
      )
      if (!vendor) {
        created[type] = await VendorModel.create(
          {
            ...defaults[type],
            vendor_type: type,
            master_id: masterId,
            status: 'active',
          },
          { transaction }
        )
      }
    }

    const systemByType = await findSystemItems(masterId, transaction)
    const missingItems = SYSTEM_ITEMS.filter(
      (item) => !systemByType.has(item.type)
    )
    if (missingItems.length) {
      const internal = await findOrCreateInternalVendor(masterId, transaction)
      created.items = await ItemModel.bulkCreate(
        missingItems.map((item) => ({
          ...item,
          vendor_id: internal.id,
          master_id: masterId,
          status: 'active',
        })),
        { transaction }
      )
    }
  })

  return {
    created,
    status: await getStatus(currentUser),
  }
}

const saveItems = async (payload, currentUser) => {
  const masterId = tenantMasterId(currentUser)
  const system = payload.system || []
  const extra = payload.extra || []
  const saved = { system: [], extra: [] }

  await sequelize.transaction(async (transaction) => {
    const vendorIds = [...new Set(extra.map((item) => item.vendor_id))]
    if (vendorIds.length) {
      const suppliers = await VendorModel.findAll({
        where: {
          id: { [Op.in]: vendorIds },
          master_id: masterId,
          vendor_type: 'supplier',
        },
        attributes: ['id'],
        transaction,
      })
      const owned = new Set(suppliers.map((vendor) => vendor.id))
      const missing = vendorIds.find((id) => !owned.has(id))
      if (missing !== undefined) {
        throw new VendorNotFoundError(missing)
      }
    }

    if (system.length) {
      const systemByType = await findSystemItems(masterId, transaction)
      let internal = null
      for (const item of system) {
        const existing = systemByType.get(item.type)
        if (existing) {
          await existing.update(
            { name: item.name, base_price: item.base_price },
            { transaction }
          )
          saved.system.push(existing)
          continue
        }
        internal =
          internal || (await findOrCreateInternalVendor(masterId, transaction))
        saved.system.push(
          await ItemModel.create(
            {
              ...item,
              vendor_id: internal.id,
              master_id: masterId,
              status: 'active',
            },
            { transaction }
          )
        )
      }
    }

    if (extra.length) {
      saved.extra = await ItemModel.bulkCreate(
        extra.map((item) => ({
          ...item,
          master_id: masterId,
          status: 'active',
        })),
        { transaction }
      )
    }
  })

  return {
    saved,
    status: await getStatus(currentUser),
  }
}

const setupService = {
  getStatus,
  generateDefaults,
  saveItems,
}

export default setupService
