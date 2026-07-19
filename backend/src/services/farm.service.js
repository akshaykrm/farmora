import { FarmNotFoundError } from '@errors/farm.errors'
import FarmModel from '@models/farm'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'

const create = async (payload, currentUser) => {
  payload.master_id = currentUser.id
  payload.own = true
  payload.status = 'active'
  const newFarm = await FarmModel.create(payload)
  return newFarm
}

const getNames = async (currentUser) => {
  const filter = {}
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const records = await FarmModel.findAll({
    where: filter,
    attributes: ['id', 'name'],
    limit: 50,
  })
  return records
}

const getAll = async (payload = {}, currentUser) => {
  const { page, limit, ...filter } = payload
  // const offset = (page - 1) * limit

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const rows = await FarmModel.findAll({
    where: filter,
    order: [['id', 'DESC']],
  })

  return {
    page,
    limit,
    total: 0,
    data: rows,
  }
}

const getById = async (farmId, currentUser) => {
  const filter = { id: farmId }
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const farmRecord = await FarmModel.findOne({ where: filter })
  if (!farmRecord) {
    throw new FarmNotFoundError(farmId)
  }

  return farmRecord
}

const updateById = async (farmId, payload, currentUser) => {
  const farmRecord = await getById(farmId, currentUser)
  await farmRecord.update(payload)
}

const deleteById = async (farmId, currentUser) => {
  const farmRecord = await getById(farmId, currentUser)
  await farmRecord.destroy()
}

const farmService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
  getNames,
}

export default farmService
