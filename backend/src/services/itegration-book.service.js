import purchaseService from '@services/purchase.service'
import itemService from '@services/items.service'
import IntegrationBookModel from '@models/integationbook'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import FarmModel from '@models/farm'
import { calculateOffSet } from '@utils/pagination'

const create = async (payload, currentUser) => {
  if (currentUser.user_type === userRoles.staff.type) {
    payload.master_id = currentUser.master_id
  } else {
    payload.master_id = currentUser.id
  }

  const record = await IntegrationBookModel.create(payload)
  return record
}

const getAll = async (filter, currentUser) => {
  const { c_page, c_limit, p_page, p_limit, farm_id, start_date, end_date } =
    filter

  const whereClause = {}
  const purchaseFilter = {}

  if (farm_id) {
    whereClause.farm_id = farm_id
    purchaseFilter.farm_id = farm_id
  }

  if (currentUser.user_type === userRoles.staff.type) {
    whereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    whereClause.master_id = currentUser.id
  }

  if (start_date && end_date) {
    const obj = {
      [Op.between]: [dayjs(start_date).toDate(), dayjs(end_date).toDate()],
    }
    whereClause.date = obj
    purchaseFilter.date = obj
  } else if (start_date) {
    const obj = { [Op.gte]: dayjs(start_date).toDate() }
    whereClause.date = obj
    purchaseFilter.date = obj
  } else if (end_date) {
    const opts = { [Op.lte]: dayjs(end_date).toDate() }
    whereClause.date = opts
    purchaseFilter.date = opts
  }

  const item = await itemService.getIntegrationItem(currentUser)
  if (item) {
    filter.category_id = item.id
    purchaseFilter.category_id = item.id
  }

  const rawPurchases = await purchaseService.getAll(purchaseFilter, currentUser)

  const purchases = rawPurchases.data.map((purchase) => purchase.toJSON())
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
    where: whereClause,
    order: [['date', 'DESC']],
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

  const c_offset = calculateOffSet(c_page, c_limit)
  const p_offset = calculateOffSet(p_page, p_limit)

  const c_count = credit.length
  const paginatedCredit = credit.slice(c_offset, c_offset + c_limit)
  const c_totalPages = Math.ceil(c_count / c_limit)

  const p_count = paid.length
  const paginatedPaid = paid.slice(p_offset, p_offset + p_limit)
  const p_totalPages = Math.ceil(p_count / p_limit)

  return {
    credit: {
      totalPages: c_totalPages,
      count: c_count,
      data: paginatedCredit,
    },
    paid: {
      totalPages: p_totalPages,
      count: p_count,
      data: paginatedPaid,
    },
    summary: {
      credit: totalCredit,
      paid: totalPaid,
      balance: totalCredit - totalPaid,
    },
  }
}

const integrationService = {
  create,
  getAll,
}

export default integrationService
