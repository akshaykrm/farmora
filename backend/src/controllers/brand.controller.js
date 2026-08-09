import brandService from '@services/brand.service'
import asyncHandler from '@utils/async-handler'

const getNames = async (req, res) => {
  const records = await brandService.getNames()
  res.success(records, { message: 'Brand names' })
}

const create = async (req, res) => {
  const record = await brandService.create(req.body)
  res.success(record, {
    message: 'Brand created successfully',
    statusCode: 201,
  })
}

const brandController = {
  getNames: asyncHandler(getNames),
  create: asyncHandler(create),
}

export default brandController
