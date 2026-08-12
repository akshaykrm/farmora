import { SeasonNotFoundError } from '@errors/season.errors'
import SeasonModel from '@models/season'
import userRoles from '@utils/user-roles'
import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { calculateOffSet } from '@utils/pagination'

const create = async (payload, currentUser) => {
  const startDate = dayjs(payload.startDate).toDate()
  const endDate = dayjs(payload.endDate).toDate()
  payload.start_date = startDate
  payload.end_date = endDate
  payload.master_id = currentUser.id
  payload.status = 'active'

  const newSeason = await SeasonModel.create(payload)
  return newSeason
}

const getNames = async (currentUser, filter) => {
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  if (filter.status === 'active') {
    filter.closed_on = {
      [Op.is]: null,
    }
  }

  const records = await SeasonModel.findAll({
    where: filter,
    attributes: ['id', 'name'],
    limit: 50,
  })
  return records
}

const getAll = async (payload = {}, currentUser) => {
  const { page, limit, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const { count, rows } = await SeasonModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  const totalPages = Math.ceil(count / limit)
  return {
    totalPages,
    data: rows,
  }
}

const getById = async (seasonId, currentUser) => {
  const filter = { id: seasonId }
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  } else if (currentUser.user_type === userRoles.staff.type) {
    filter.master_id = currentUser.master_id
  }

  const seasonRecord = await SeasonModel.findOne({ where: filter })
  if (!seasonRecord) {
    throw new SeasonNotFoundError(seasonId)
  }
  return seasonRecord
}

const updateById = async (seasonId, payload, currentUser) => {
  const seasonRecord = await getById(seasonId, currentUser)
  await seasonRecord.update(payload)
}

const close = async (seasonId, currentUser) => {
  await updateById(seasonId, { closed_on: dayjs().toDate() }, currentUser)
}

const deleteById = async (packageID, currentUser) => {
  const seasonRecord = await getById(packageID, currentUser)
  await seasonRecord.destroy()
}

const seasonService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
  getNames,
  close,
}

export default seasonService
