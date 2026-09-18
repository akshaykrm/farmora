import { Op } from 'sequelize'
import PackageModel from '@models/package'
import { PackageNotFoundError } from '@errors/package.errors'

const create = async (insertData) => {
  return await PackageModel.create(insertData)
}

const getAll = async (payload) => {
  const { limit, page, ...filter } = payload
  const offset = (page - 1) * limit

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  const { count, rows } = await PackageModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    data: rows,
  }
}

const getById = async (id) => {
  const packageRecord = await PackageModel.findOne({ where: { id } })
  if (!packageRecord) {
    throw new PackageNotFoundError(id)
  }
  return packageRecord
}

const updateById = async (id, data) => {
  const packageRecord = await getById(id)
  await packageRecord.update(data)
}

const deleteById = async (id) => {
  const packageRecord = await packageService.getById(id)
  await packageRecord.destroy()
}

const getNames = async () => {
  const records = await PackageModel.findAll({
    where: { status: 'active' },
    attributes: ['id', 'name'],
    order: [['id', 'DESC']],
  })
  return records
}

const packageService = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
  getNames,
}

export default packageService
