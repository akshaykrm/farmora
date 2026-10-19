import purchaseService from '@services/purchase.service'
import itemService from '@services/items.service'
import IntegrationBookModel from '@models/integationbook'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
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

/**
 * Builds the full (unpaginated) credit and paid lists with totals.
 * Used by the paginated list and by exports.
 */
const buildIntegrationBook = async (filter, currentUser) => {
  const { farm_id, start_date, end_date } = filter

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
    whereClause.date = {
      [Op.between]: [dayjs(start_date).toDate(), dayjs(end_date).toDate()],
    }
  } else if (start_date) {
    whereClause.date = { [Op.gte]: dayjs(start_date).toDate() }
  } else if (end_date) {
    whereClause.date = { [Op.lte]: dayjs(end_date).toDate() }
  }
  if (start_date) purchaseFilter.start_date = dayjs(start_date).toDate()
  if (end_date) purchaseFilter.end_date = dayjs(end_date).toDate()

  const item = await itemService.getIntegrationItem(currentUser)
  let purchases = []
  if (item) {
    purchaseFilter.category_id = item.id
    const rawPurchases = await purchaseService.getAllEvenIfBatchClosed(
      purchaseFilter,
      currentUser
    )
    purchases = rawPurchases.data.map((purchase) => purchase.toJSON())
  }

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

  return {
    credit,
    paid,
    summary: {
      credit: totalCredit,
      paid: totalPaid,
      balance: totalCredit - totalPaid,
    },
  }
}

const getAll = async (filter, currentUser) => {
  const { c_page, c_limit, p_page, p_limit } = filter
  const { credit, paid, summary } = await buildIntegrationBook(
    filter,
    currentUser
  )

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
    summary,
  }
}

const integrationService = {
  create,
  getAll,
  buildIntegrationBook,
}

export default integrationService
