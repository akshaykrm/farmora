import BrandModel from '@models/brand'

const getNames = async () => {
  const records = await BrandModel.findAll({
    where: { status: 'active' },
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })
  return records
}

const brandService = {
  getNames,
}

export default brandService
