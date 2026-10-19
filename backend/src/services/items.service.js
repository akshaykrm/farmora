import { ItemCategoryNotFoundError } from '@errors/item-category.errors'

import VendorModel from '@models/vendor'
import ItemModel from '@models/items.model'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import { calculateOffSet } from '@utils/pagination'
import { tenantMasterId } from '@utils/tenant-scope'

const create = async (payload, currentUser) => {
  payload.status = 'active'
  if (currentUser.user_type === userRoles.staff.type) {
    payload.master_id = currentUser.master_id
  } else {
    payload.master_id = currentUser.id
  }

  const newRecord = await ItemModel.create(payload)
  return newRecord
}

const getNames = async (currentUser) => {
  const filter = {}
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const records = await ItemModel.findAll({
    where: filter,
    attributes: ['id', 'name', 'type'],
    limit: 50,
  })
  return records
}

const getItemsByVendorId = async (vendorID, currentUser) => {
  const filter = {
    vendor_id: vendorID,
  }

  if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const record = await ItemModel.findAll({
    where: filter,
    attributes: ['id', 'name', 'base_price', 'type'],
    limit: 50,
  })

  return record
}

const getAll = async (payload, currentUser) => {
  const { limit, page, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const { count, rows } = await ItemModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
    include: [{ model: VendorModel, as: 'vendor', required: true }],
  })

  const totalPages = Math.ceil(count / limit)
  return {
    totalPages: totalPages,
    data: rows,
  }
}

const getById = async (itemCategoryId, currentUser) => {
  const filter = {
    id: itemCategoryId,
  }

  if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const record = await ItemModel.findOne({
    where: filter,
  })
  if (!record) {
    throw new ItemCategoryNotFoundError(itemCategoryId)
  }

  return record
}

const updateById = async (itemCategoryId, payload, currentUser) => {
  const itemCategoryRecord = await getById(itemCategoryId, currentUser)
  await itemCategoryRecord.update(payload)
}

const deleteById = async (itemCategoryId, currentUser) => {
  const itemCategory = await getById(itemCategoryId, currentUser)
  itemCategory.destroy()
}

export const SYSTEM_ITEMS = [
  { name: 'Integration Cost', type: 'integration', base_price: 0 },
  { name: 'Working Cost', type: 'working', base_price: 0 },
  { name: 'General', type: 'general', base_price: 0 },
]

export const SYSTEM_ITEM_TYPES = SYSTEM_ITEMS.map((item) => item.type)

export const findOrCreateInternalVendor = async (masterId, transaction) => {
  const existing = await VendorModel.findOne({
    where: { master_id: masterId, vendor_type: 'internal' },
    order: [['id', 'ASC']],
    transaction,
  })
  if (existing) return existing

  return VendorModel.create(
    {
      name: 'Internal',
      vendor_type: 'internal',
      address: 'nil',
      opening_balance: 0,
      status: 'active',
      master_id: masterId,
    },
    { transaction }
  )
}

const ensureSystemItem = async (type, currentUser, transaction) => {
  const definition = SYSTEM_ITEMS.find((item) => item.type === type)
  if (!definition) {
    throw new Error(`unknown system item type: ${type}`)
  }

  const masterId = tenantMasterId(currentUser)
  const existing = await ItemModel.findOne({
    where: { master_id: masterId, type },
    order: [['id', 'ASC']],
    transaction,
  })
  if (existing) return existing

  const vendor = await findOrCreateInternalVendor(masterId, transaction)
  return ItemModel.create(
    {
      ...definition,
      vendor_id: vendor.id,
      master_id: masterId,
      status: 'active',
    },
    { transaction }
  )
}

const getIntegrationItem = async (currentUser) => {
  const item = await ensureSystemItem('integration', currentUser)
  return item.toJSON()
}

const getWorkingItem = async (currentUser) => {
  const item = await ensureSystemItem('working', currentUser)
  return item.toJSON()
}

const itemService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
  getNames,
  getItemsByVendorId,
  getIntegrationItem,
  getWorkingItem,
  ensureSystemItem,
}

export default itemService
