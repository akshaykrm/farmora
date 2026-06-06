import WorkingCostModel from '@models/workingcost'
import purchaseService from '@services/purchase.service'
import itemService from '@services/items.service'
import userRoles from '@utils/user-roles'
import dayjs from 'dayjs'
import { Op } from 'sequelize'

const create = async (payload, currentUser) => {
  if (currentUser.user_type === userRoles.staff.type) {
    payload.master_id = currentUser.master_id
  } else {
    payload.master_id = currentUser.id
  }

  const record = await WorkingCostModel.create(payload)
  return record
}

const getAll = async (filter, currentUser) => {
  const { season_id, start_date, end_date } = filter
  const whereClause = {}

  if (season_id) {
    whereClause.season_id = season_id
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

  const workingCostRecords = await WorkingCostModel.findAll({
    where: whereClause,
    attributes: ['id', 'date', 'purpose', 'amount', 'payment_type'],
  })

  const expense = workingCostRecords.filter(
    (record) => record.payment_type === 'income'
  )

  const income = workingCostRecords.filter(
    (record) => record.payment_type === 'expense'
  )


  const item = await itemService.getWorkingItem(currentUser)
  if (item) {
    filter.category_id = item.id
  }

  const rawWorkingCost = await purchaseService.getAll(filter, currentUser)

  const parsedWorkingCost = rawWorkingCost.data.map((item) => {
    return {
      id: item.id,
      date: item.invoice_date,
      purpose: `Working Cost to ${item.batch.name}`,
      amount: item.net_amount,
    }
  })

  const parsedIncome = income.map((item) => {
    return {
      id: item.id,
      date: item.date,
      purpose: item.purpose,
      amount: item.amount,
    }
  })

  const combinedIncome = [...parsedIncome, ...parsedWorkingCost]
  const sortedCombinedIncome = combinedIncome.sort((a, b) => {
    const isBefore = dayjs(a.date).isBefore(b.date)
    if (isBefore) {
      return 1
    } else {
      return -1
    }
  })

  const parsedExpense = expense.map((item) => {
    return {
      id: item.id,
      date: item.date,
      purpose: item.purpose,
      amount: item.amount,
    }
  })

  const totalIncome = sortedCombinedIncome.reduce((acc, curr) => {
    const parsedAmount = parseFloat(curr.amount)
    return parsedAmount + acc
  }, 0)

  const totalExpense = parsedExpense.reduce((acc, curr) => {
    const parsedAmount = parseFloat(curr.amount)
    return parsedAmount + acc
  }, 0)

  return {
    income: sortedCombinedIncome,
    expense: parsedExpense,
    totals: {
      income: totalIncome,
      expanse: totalExpense,
      balance: totalIncome - totalExpense,
    },
  }
}

const workingCostService = {
  create,
  getAll,
}

export default workingCostService
