import {
  ItemAssignmentNotFoundError,
  ItemAssignQuantityError,
  ItemNotFoundError,
  ItemQuantityUnderflowError,
} from '@errors/item.errors'
import VendorModel from '@models/vendor'
import ItemModel from '@models/items.model'
import PurchaseModel from '@models/purchase'
import PurchaseReturnModel from '@models/purchase-return'
import PurchaseBookModel from '@models/purchasebook'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import purchaseBatchAssignmentService from '@services/purchase-batch-assignment'
import PurchaseBatchAssignmentModel from '@models/purchasebatchassignment'
import BatchModel from '@models/batch'
import SeasonModel from '@models/season'
import dayjs from 'dayjs'
import batchService from '@services/batch.service'
import vendorService from './vendor.service'
import FarmModel from '@models/farm'
import IntegrationBookModel from '@models/integationbook'

export async function getAllPurchaseWithBatchActive(where) {
  const purchases = await PurchaseModel.findAll({
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
  return purchases
}

const create = async (payload, currentUser) => {
  const { quantity, assign_quantity } = payload
  if (assign_quantity) {
    const qty = quantity - assign_quantity
    if (qty < 0) {
      throw new ItemAssignQuantityError(qty, assignQty)
    }
    payload.quantity = qty
  }

  if (currentUser.user_type === userRoles.staff.type) {
    payload.master_id = currentUser.master_id
  } else {
    payload.master_id = currentUser.id
  }

  payload.name = 'test'

  const batch = await batchService.getById(payload.batch_id, currentUser)

  payload.farm_id = batch.farm_id
  const newItem = await PurchaseModel.create(payload)

  if (payload.batch_id) {
    await purchaseBatchAssignmentService.create({
      batch_id: payload.batch_id,
      purchase_id: newItem.id,
      quantity: payload.assign_quantity,
    })
  }

  return newItem
}

const createPurchaseBook = async (payload, currentUser) => {
  if (currentUser.user_type === userRoles.staff.type) {
    payload.master_id = currentUser.master_id
  } else {
    payload.master_id = currentUser.id
  }
  const newRecord = await PurchaseBookModel.create(payload)
  return newRecord
}

const getPurchaseBook = async (filter, currentUser) => {
  const { vendorId, start_date, end_date } = filter
  const whereClause = {
    vendor_id: vendorId,
  }

  const returnWhereClause = {
    to_vendor: vendorId,
  }

  if (start_date && end_date) {
    const start = dayjs(start_date).startOf('day').toDate()
    const end = dayjs(end_date).endOf('day').toDate()

    whereClause.invoice_date = {
      [Op.between]: [start, end],
    }

    returnWhereClause.invoice_date = {
      [Op.between]: [start, end],
    }
  }
  if (currentUser.user_type === userRoles.staff.type) {
    whereClause.master_id = currentUser.master_id
    returnWhereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    whereClause.master_id = currentUser.id
    returnWhereClause.master_id = currentUser.id
  }

  const vendor = await vendorService.getById(vendorId, currentUser)

  const purchases = await PurchaseModel.findAll({
    where: {
      ...whereClause,
    },
    order: [['invoice_date', 'DESC']],
    include: [
      { model: VendorModel, as: 'vendor', required: true },
      { model: ItemModel, as: 'category', required: false },
    ],
  })

  const returnedRecords = await PurchaseReturnModel.findAll({
    where: { ...returnWhereClause, payment_type: 'paid' },
  })

  const paidRecords = await PurchaseBookModel.findAll({
    where: whereClause,
  })

  const returnList = returnedRecords.map((p) => {
    return {
      id: p.id,
      date: p.date,
      amount: p.total_amount,
      type: 'return',
    }
  })

  const transformedPaidRecords = paidRecords.map((p) => {
    return {
      id: p.id,
      date: p.date,
      amount: p.amount,
      type: 'cached-out',
    }
  })

  const creditList = purchases.map((p) => {
    return {
      id: p.id,
      date: p.invoice_date,
      quantity: p.quantity,
      price: p.price_per_unit,
      amount: p.total_price,
      type: p.payment_type,
    }
  })

  const transactions = [...returnList, ...transformedPaidRecords, ...creditList]
  const sorted = [...transactions].sort(
    (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
  )

  let balance = parseFloat(vendor.opening_balance || '0')
  const purchasesWithBalance = sorted.map((item) => {
    if (item.type === 'credit') {
      balance = parseFloat(balance) + parseFloat(item.amount)
    } else if (item.type === 'return') {
      balance = parseFloat(balance) - parseFloat(item.amount)
    } else if (item.type === 'cached-out') {
      balance = parseFloat(balance) - parseFloat(item.amount)
    }

    const newObj = {
      ...item,
      balance: balance,
    }
    return newObj
  })

  let temp = 0
  creditList.forEach((c) => {
    temp += parseFloat(c.amount)
  })
  const totalCredit = creditList.reduce((acc, curr) => {
    return acc + parseFloat(curr.amount)
  }, 0)

  const totalPaid = [...transformedPaidRecords, ...returnList].reduce(
    (acc, curr) => {
      return acc + parseFloat(curr.amount)
    },
    0
  )

  return {
    items: purchasesWithBalance.reverse(),
    credit: totalCredit,
    paid: totalPaid,
    balance: balance,
  }
}

const reassignToAnotherBatch = async (payload, currentUser) => {
  const { item_id, source_batch_id, target_batch_id, quantity } = payload

  const sourceAssignment =
    await purchaseBatchAssignmentService.getOneByBatchAndPurchaseId(
      source_batch_id,
      item_id
    )

  if (!sourceAssignment) {
    throw new ItemAssignmentNotFoundError(source_batch_id, source_item_id)
  }

  if (sourceAssignment.quantity < quantity) {
    throw new ItemQuantityUnderflowError(quantity)
  }

  const targetAssignment =
    await purchaseBatchAssignmentService.getOneByBatchAndPurchaseId(
      target_batch_id,
      item_id
    )
  if (targetAssignment) {
    await targetAssignment.update({
      quantity: sourceAssignment.quantity + quantity,
    })
  } else {
    await assignItemToBatch(
      { item_id, batch_id: target_batch_id, quantity },
      currentUser,
      { reassign: true }
    )
  }

  return await sourceAssignment.update({
    quantity: sourceAssignment.quantity - quantity,
  })
}

const assignItemToBatch = async (payload, currentUser, opts = {}) => {
  const { item_id, batch_id, quantity } = payload

  const assignmentRecord =
    await purchaseBatchAssignmentService.getOneByBatchAndPurchaseId(
      batch_id,
      item_id
    )

  const itemRecord = await getById(item_id, currentUser)
  const qty = itemRecord.quantity - quantity
  if (qty < 0) {
    throw new ItemQuantityUnderflowError(qty)
  }

  let record = null
  if (assignmentRecord) {
    payload.quantity = assignmentRecord.quantity + payload.quantity

    record =
      await purchaseBatchAssignmentService.updateByBatchIdAndPurchaseId(payload)
  } else {
    record = await purchaseBatchAssignmentService.create(payload)
  }

  if (!opts.reassign) {
    await updateById(item_id, { quantity: qty }, currentUser)
  }
  return record
}

const getAll = async (payload, currentUser) => {
  const { page, limit, ...filter } = payload
  const offset = (page - 1) * limit

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  if (filter.start_date || filter.end_date) {
    filter.invoice_date = {}
    if (filter.start_date) {
      filter.invoice_date[Op.gte] = filter.start_date
      delete filter.start_date
    }
    if (filter.end_date) {
      filter.invoice_date[Op.lte] = filter.end_date
      delete filter.end_date
    }
  }

  const rows = await PurchaseModel.findAll({
    where: filter,
    order: [['id', 'DESC']],
    attributes: {
      exclude: ['category_id', 'vendor_id'],
    },
    include: [
      {
        model: FarmModel,
        as: 'farm',
        required: true,
      },
      {
        model: BatchModel,
        as: 'batch',
        required: true,
      },
      { model: ItemModel, as: 'category', required: false },
      { model: VendorModel, as: 'vendor', required: false },
      {
        model: PurchaseBatchAssignmentModel,
        as: 'assignments',
        required: false,
        attributes: { exclude: ['item_id', 'createdAt', 'updatedAt'] },
      },
    ],
  })

  return {
    data: rows,
  }
}

const getInternalPurchaseTypes = async (filter, type) => {
  const rawPurchases = await PurchaseModel.findAll({
    where: filter,
    include: [
      {
        model: FarmModel,
        as: 'farm',
        required: true,
      },
      {
        model: BatchModel,
        as: 'batch',
        required: true,
      },
      {
        model: ItemModel,
        as: 'category',
        required: true,
        where: { type: type },
      },
    ],
  })
  return rawPurchases
}

const getIntegrationBook = async (filter, currentUser) => {
  const { farm_id, start_date, end_date } = filter

  const whereClausePurchase = {}
  const whereClauseIntegration = {}

  if (farm_id) {
    whereClausePurchase.farm_id = farm_id
    whereClauseIntegration.farm_id = farm_id
  }

  if (currentUser.user_type === userRoles.manager.type) {
    whereClausePurchase.master_id = currentUser.id
    whereClauseIntegration.master_id = currentUser.id
  }

  if (start_date && end_date) {
    whereClausePurchase.invoice_date = {
      [Op.between]: [start_date, end_date],
    }
    whereClauseIntegration.date = {
      [Op.between]: [start_date, end_date],
    }
  } else if (start_date) {
    whereClausePurchase.invoice_date = {
      [Op.gte]: start_date,
    }
    whereClauseIntegration.date = {
      [Op.gte]: start_date,
    }
  } else if (end_date) {
    whereClausePurchase.invoice_date = {
      [Op.lte]: end_date,
    }
    whereClauseIntegration.date = {
      [Op.lte]: end_date,
    }
  }

  const rawPurchases = await getInternalPurchaseTypes(
    whereClausePurchase,
    'integration'
  )

  const purchases = rawPurchases.map((purchase) => purchase.toJSON())
  const credit = purchases
    .filter(({ payment_type }) => payment_type === 'credit')
    ?.map((item) => {
      return {
        id: item.id,
        date: item.invoice_date,
        name: `Integration Cost to ${item.batch.name}`,
        net_amount: item.net_amount,
      }
    })

  const rawPaid = await IntegrationBookModel.findAll({
    where: whereClauseIntegration,
    include: [
      {
        model: FarmModel,
        as: 'farm',
        required: true,
      },
    ],
  })
  const paid = rawPaid.map((paid) => {
    const transformed = paid.toJSON()

    return {
      id: transformed.id,
      net_amount: transformed.amount,
      date: transformed.date,
      name: `Paid to ${transformed.farm.name}`,
    }
  })

  const totalPaid = paid.reduce((acc, curr) => {
    const parsedAmount = parseFloat(curr.net_amount)
    return parsedAmount + acc
  }, 0)

  const totalCredit = credit.reduce((acc, curr) => {
    const parsedAmount = parseFloat(curr.net_amount)
    return parsedAmount + acc
  }, 0)

  return {
    credit,
    paid,
    totals: {
      paid: totalPaid,
      credit: totalCredit,
      balance: totalPaid - totalCredit,
    },
  }
}

const getById = async (itemId, currentUser, opts = {}) => {
  const {} = opts
  const filter = { id: itemId }

  if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const record = await PurchaseModel.findOne({
    where: filter,
    attributes: {
      exclude: ['category_id', 'vendor_id', 'batch_id'],
    },
    include: [
      { model: ItemModel, as: 'category', required: false },
      { model: VendorModel, as: 'vendor', required: false },
      { model: BatchModel, as: 'batch', required: false },
      { model: SeasonModel, as: 'season', required: false },
    ],
  })

  if (!record) {
    throw new ItemNotFoundError(itemId)
  }

  if (opts.asJSON) {
    const item = record.toJSON()
    const assignment =
      await purchaseBatchAssignmentService.getOneByBatchAndPurchaseId(
        record.batch.id,
        record.id
      )

    return {
      ...item,
      assign_quantity: assignment.quantity,
    }
  }

  return record
}

const updateById = async (id, payload, currentUser) => {
  if (payload.quantity < payload.assign_quantity) {
    throw new ItemAssignQuantityError(payload.assign_quantity, payload.quantity)
  }

  const purchaseRecord = await getById(id, currentUser)

  const currentAssignment =
    await purchaseBatchAssignmentService.getOneByBatchAndPurchaseId(
      payload.batch_id,
      id
    )

  const calculateNewQty = (assignQuantity, currentAssignQty) => {
    const assignQtyDifference = assignQuantity - currentAssignQty
    if (assignQtyDifference < 0) {
      return payload.quantity + assignQtyDifference * -1
    } else {
      return payload.quantity - assignQtyDifference
    }
  }

  if (currentAssignment) {
    const updateData = {
      purchase_id: id,
      batch_id: payload.batch_id,
      quantity: payload.assign_quantity,
    }
    console.log('update data:', updateData)
    const updatedRecord =
      await purchaseBatchAssignmentService.updateByBatchIdAndPurchaseId(
        updateData
      )
    console.log('updated assignment: ', updatedRecord)
    payload.quantity = calculateNewQty(
      payload.assign_quantity,
      currentAssignment.quantity
    )
  } else {
    const newAssignment = await purchaseBatchAssignmentService.create({
      purchase_id: id,
      batch_id: payload.batch_id,
      quantity: payload.assign_quantity,
    })
    payload.quantity = calculateNewQty(
      payload.assign_quantity,
      newAssignment.quantity
    )
  }

  const updatedPurchaseRecord = await purchaseRecord.update(payload)
  return updatedPurchaseRecord
}

const deleteById = async (id, currentUser) => {
  const itemRecord = await getById(id, currentUser)
  await itemRecord.destroy()
}

const purchaseService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
  assignItemToBatch,
  reassignToAnotherBatch,
  getPurchaseBook,
  getIntegrationBook,
  getInternalPurchaseTypes,
  createPurchaseBook,
}

export default purchaseService
