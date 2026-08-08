import packageService from '@services/package.service'
import asyncHandler from '@utils/async-handler'

const create = async (req, res) => {
  const payload = req.body
  const newPackage = await packageService.create(payload)
  res.success(newPackage, { message: 'package created' })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  }

  if (req.query.status) {
    filter.status = req.query.status
  }
  if (req.query.name) {
    filter.name = req.query.name
  }

  const packageRecords = await packageService.getAll(filter)
  res.success(packageRecords, { message: 'packages list' })
}

const getById = async (req, res) => {
  const { package_id } = req.params
  const packageRecord = await packageService.getById(package_id)
  res.success(packageRecord, { message: 'package details' })
}

const update = async (req, res) => {
  const { package_id } = req.params
  const packageData = req.body
  await packageService.updateById(package_id, packageData)
  res.success(null, { message: 'package updated' })
}

const deleteById = async (req, res) => {
  const { package_id } = req.params
  await packageService.deleteById(package_id)
  res.success(null, { message: 'package deleted' })
}

const packageController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(update),
  deleteById: asyncHandler(deleteById),
}

export default packageController
