import { FarmNotFoundError } from '@errors/farm.errors'
import FarmModel from '@models/farm'
import { Op } from 'sequelize'
import { calculateOffSet } from '@utils/pagination'
import { applyTenantMasterId, tenantMasterId } from '@utils/tenant-scope'

const create = async (payload, currentUser) => {
  payload.master_id = tenantMasterId(currentUser)
  payload.own = true
  payload.status = 'active'
  const newFarm = await FarmModel.create(payload)
  return newFarm
}

const getNames = async (currentUser) => {
  const filter = {}
  applyTenantMasterId(filter, currentUser)

  const records = await FarmModel.findAll({
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

  applyTenantMasterId(filter, currentUser)

  const { rows, count } = await FarmModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  const totalPages = Math.ceil(count / limit)
  return {
    totalPages: totalPages,
    data: rows,
  }
}

const getById = async (farmId, currentUser) => {
  const filter = { id: farmId }
  applyTenantMasterId(filter, currentUser)

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
