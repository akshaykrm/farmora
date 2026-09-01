import PurchaseReturnModel from '@models/purchase-return'
import ItemModel from '@models/items.model'
import BatchModel from '@models/batch'
import VendorModel from '@models/vendor'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import logger from '@utils/logger'
import itemService from '@services/items.service'
import { calculateOffSet } from '@utils/pagination'

export async function getAllReturnsWithBatchActive(where) {
  const retunredItems = await PurchaseReturnModel.findAll({
    where,
    include: [
      {
        model: ItemModel,
        as: 'category',
      },
      {
        model: BatchModel,
        as: 'batch',
        where: {
          closed_on: {
            [Op.is]: null,
          },
        },
      },
    ],
  })
  return retunredItems
}
async function create(payload, currentUser) {
  logger.debug({ payload, currentUser }, 'Creating item return: raw input')

  if (currentUser.user_type === userRoles.staff.type) {
    payload.master_id = currentUser.master_id
  } else {
    payload.master_id = currentUser.id
  }
  logger.debug(
    { resolved_master_id: payload.master_id },
    'Resolved master owner id'
  )

  // Validate that either to_batch or to_vendor is set based on return_type
  if (payload.return_type === 'batch' && !payload.to_batch) {
    throw new Error('to_batch is required when return_type is batch')
  }
  if (payload.return_type === 'vendor' && !payload.to_vendor) {
    throw new Error('to_vendor is required when return_type is vendor')
  }

  // Set null for the unused field
  if (payload.return_type === 'batch') {
    payload.to_vendor = null
  } else {
    payload.to_batch = null
  }

  logger.info({ item_return: payload }, 'Creating item return')

  const newItemReturn = await PurchaseReturnModel.create(payload)

  logger.info({ item_return_id: newItemReturn.id }, 'Item return created')
  const item = await itemService.getById(payload.item_category_id, currentUser)

  itemService.updateById(
    item.id,
    { quantity: item.quantity - payload.quantity },
    currentUser
  )

  return newItemReturn
}

const getAll = async (payload, currentUser) => {
  const { page, limit, return_type, status, ...filter } = payload

  if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  if (return_type !== 'all') {
    filter.return_type = return_type
  }

  if (filter.start_date || filter.end_date) {
    filter.date = {}
    if (filter.start_date) {
      filter.date[Op.gte] = new Date(filter.start_date)
      delete filter.start_date
    }
    if (filter.end_date) {
      filter.date[Op.lte] = new Date(filter.end_date)
      delete filter.end_date
    }
  }
  const offset = calculateOffSet(page, limit)

  const { count, rows } = await PurchaseReturnModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
    attributes: {
      exclude: ['item_category_id', 'from_batch', 'to_batch', 'to_vendor'],
    },
    include: [
      { model: ItemModel, as: 'category', required: false },
      {
        model: BatchModel,
        as: 'from_batch_data',
        required: true,
        attributes: ['id', 'name'],
        where: {
          closed_on: {
            [Op.is]: null,
          },
        },
      },
      {
        model: BatchModel,
        as: 'to_batch_data',
        required: true,
        attributes: ['id', 'name'],
        where: {
          closed_on: {
            [Op.is]: null,
          },
        },
      },
      {
        model: VendorModel,
        as: 'to_vendor_data',
        required: false,
        attributes: ['id', 'name'],
      },
    ],
  })

  const totalPages = Math.ceil(count / limit)
  return {
    data: rows,
    totalPages: totalPages,
  }
}

const getById = async (itemReturnId, currentUser) => {
  const filter = { id: itemReturnId }

  if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  logger.debug({ filter }, 'Getting item return by id')
  const record = await PurchaseReturnModel.findOne({
    where: filter,
    attributes: {
      exclude: ['item_category_id', 'from_batch', 'to_batch', 'to_vendor'],
    },
    include: [
      { model: ItemModel, as: 'category', required: false },
      {
        model: BatchModel,
        as: 'from_batch_data',
        required: false,
        attributes: ['id', 'name'],
      },
      {
        model: BatchModel,
        as: 'to_batch_data',
        required: false,
        attributes: ['id', 'name'],
      },
      {
        model: VendorModel,
        as: 'to_vendor_data',
        required: false,
        attributes: ['id', 'name'],
      },
    ],
  })
  logger.debug({ itemReturnRecord: record }, 'Item return retrieved')

  if (!record) {
    throw new Error(`Item return with id ${itemReturnId} not found`)
  }

  logger.info(
    {
      item_return_id: record.id,
      actor_id: currentUser.id,
    },
    'Item return retrieved by id'
  )

  logger.debug({ item_return_id: record.id, payment_type: record.payment_type }, 'Item return fetched')
  return record
}

const updateById = async (id, payload, currentUser) => {
  logger.debug(
    { item_return_id: id, updated_data: payload, actor_id: currentUser.id },
    'Updating item return: raw payload'
  )

  logger.info(
    {
      item_return_id: id,
      updated_keys: Object.keys(payload),
      actor_id: currentUser.id,
    },
    'Updating item return'
  )
  const itemReturnRecord = await getById(id, currentUser)
  await itemReturnRecord.update(payload)
  logger.info({ item_return_id: itemReturnRecord.id }, 'Item return updated')
}

const deleteById = async (id, currentUser) => {
  logger.debug(
    { item_return_id: id, actor_id: currentUser.id },
    'Deleting item return: resolving record'
  )
  const itemReturnRecord = await getById(id, currentUser)
  await itemReturnRecord.destroy()
  logger.info(
    { item_return_id: id, actor_id: currentUser.id },
    'Item return deleted'
  )
}

const purchaseReturnService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
}

export default purchaseReturnService
