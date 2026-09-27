import BrandModel from '@models/brand'

const getNames = async () => {
  const records = await BrandModel.findAll({
    where: { status: 'active' },
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })
  return records
}

const create = async (payload) => {
  const [record] = await BrandModel.findOrCreate({
    where: { name: payload.name },
    defaults: { name: payload.name, status: 'active' },
  })
  return record
}

const brandService = {
  getNames,
  create,
}

export default brandService
