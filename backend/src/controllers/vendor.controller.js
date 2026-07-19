import vendorService from '@services/vendor.service'
import asyncHandler from '@utils/async-handler'

const create = async (req, res) => {
  const newVendor = await vendorService.create(req.body, req.user)
  res.success(newVendor, {
    message: 'Vendor created successfully',
    statusCode: 201,
  })
}

const getNames = async (req, res) => {
  const { type } = req.query

  const filter = {}
  if (type) {
    filter.vendor_type = type
  }

  const records = await vendorService.getNames(filter, req.user)
  res.success(records, { message: 'vendor names' })
}

const getAll = async (req, res) => {
  const filter = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  }

  if (req.query.master_id) {
    filter.master_id = req.query.master_id
  }
  if (req.query.status) {
    filter.status = req.query.status
  }

  if (req.query.name) {
    filter.name = req.query.name
  }
  if (req.query.vendor_type) {
    filter.vendor_type = req.query.vendor_type
  }

  const vendorRecords = await vendorService.getAll(filter, req.user)
  res.success(vendorRecords, { message: 'Vendors fetched successfully' })
}

const getById = async (req, res) => {
  const { vendor_id } = req.params
  const vendorRecord = await vendorService.getById(vendor_id, req.user)
  res.success(vendorRecord, { message: 'Vendor details fetched successfully' })
}

const updateById = async (req, res) => {
  const { vendor_id } = req.params
  const payload = req.body

  await vendorService.updateById(vendor_id, payload, req.user)
  res.success(null, { message: 'Vendor updated successfully' })
}

const deleteById = async (req, res) => {
  const { vendor_id } = req.params
  await vendorService.deleteById(vendor_id, req.user)
  res.success(null, { message: 'Vendor deleted successfully', statusCode: 204 })
}

const vendorController = {
  create: asyncHandler(create),
  getAll: asyncHandler(getAll),
  getById: asyncHandler(getById),
  updateById: asyncHandler(updateById),
  deleteById: asyncHandler(deleteById),
  getNames: asyncHandler(getNames),
}

export default vendorController
