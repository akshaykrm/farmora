import ExpenseSalesModel from '@models/expensesales'
import SeasonModel from '@models/season'
import userRoles from '@utils/user-roles'
import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { calculateOffSet } from '@utils/pagination'
import logger from '@utils/logger'

const create = async (payload, currentUser) => {
  if (currentUser.user_type === userRoles.staff.type) {
    payload.master_id = currentUser.master_id
  } else {
    payload.master_id = currentUser.id
  }

  const record = await ExpenseSalesModel.create(payload)
  return record
}

const getAll = async (filter, currentUser) => {
  const { limit, page, season_id, start_date, end_date, purpose } = filter
  const whereClause = {}
  const offset = calculateOffSet(page, limit)

  if (season_id) {
    whereClause.season_id = season_id
  }

  if (purpose) {
    whereClause.purpose = {
      [Op.like]: `%${purpose}%`,
    }
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

  if (currentUser.user_type === userRoles.staff.type) {
    whereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    whereClause.master_id = currentUser.id
  }

  const [paginatedData, totalAmount] = await Promise.all([
    ExpenseSalesModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['date', 'DESC']],
      include: [
        {
          model: SeasonModel,
          as: 'season',
          required: true,
          where: {
            closed_on: {
              [Op.is]: null,
            },
          },
        },
      ],
    }),

    ExpenseSalesModel.sum('amount', {
      where: whereClause,
      include: [
        {
          model: SeasonModel,
          as: 'season',
          required: true,
          attributes: [],
          where: {
            closed_on: {
              [Op.is]: null,
            },
          },
        },
      ],
    }),
  ])

  const { count, rows } = paginatedData
  logger.debug({ expense_count: count }, 'General sales fetched')

  const totalPages = Math.ceil(count / limit)
  return {
    totalPages: totalPages,
    totalAmount,
    data: rows,
  }
}

const getById = async (id, currentUser) => {
  const whereClause = { id }

  if (currentUser.user_type === userRoles.staff.type) {
    whereClause.master_id = currentUser.master_id
  } else if (currentUser.user_type === userRoles.manager.type) {
    whereClause.master_id = currentUser.id
  }

  const record = await ExpenseSalesModel.findOne({
    where: whereClause,
  })

  if (!record) {
    throw new Error('Expense sales record not found')
  }

  return record
}

const updateById = async (id, payload, currentUser) => {
  const record = await getById(id, currentUser)
  await record.update(payload)
}

const deleteById = async (id, currentUser) => {
  const record = await getById(id, currentUser)
  await record.destroy()
}

const expenseSalesService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
}

export default expenseSalesService
