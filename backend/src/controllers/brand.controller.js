import brandService from '@services/brand.service'
import asyncHandler from '@utils/async-handler'

const getNames = async (req, res) => {
  const records = await brandService.getNames()
  res.success(records, { message: 'Brand names' })
}

const brandController = {
  getNames: asyncHandler(getNames),
}

export default brandController
