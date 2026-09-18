import { VendorNotFoundError } from '@errors/vendor.errors'
import VendorModel from '@models/vendor'
import { Op } from 'sequelize'
import { calculateOffSet } from '@utils/pagination'
import { applyTenantMasterId, tenantMasterId } from '@utils/tenant-scope'

const create = async (payload, currentUser) => {
  payload.master_id = tenantMasterId(currentUser)
  payload.status = 'active'
  const newVendor = await VendorModel.create(payload)
  return newVendor
}

const createInternalVendor = async (currentUser) => {
  const newVendor = {
    name: 'Internal',
    vendor_type: 'internal',
    address: 'nil',
    opening_balance: 0,
    status: 'active',
  }
  return create(newVendor, currentUser)
}

const getNames = async (filter, currentUser) => {
  const whereClause = {}
  applyTenantMasterId(whereClause, currentUser)

  if (filter.types) {
    whereClause.vendor_type = {
      [Op.in]: Array.isArray(filter.types) ? filter.types : [filter.types],
    }
  }

  const records = await VendorModel.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'vendor_type'],
    limit: 50,
  })
  return records
}

const getAll = async (payload, currentUser) => {
  const { page, limit, ...filter } = payload
  const offset = calculateOffSet(page, limit)

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  applyTenantMasterId(filter, currentUser)

  const { count, rows } = await VendorModel.findAndCountAll({
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

const getById = async (vendorId, currentUser) => {
  const filter = { id: vendorId }
  applyTenantMasterId(filter, currentUser)

  const vendorRecord = await VendorModel.findOne({ where: filter })
  if (!vendorRecord) {
    throw new VendorNotFoundError(vendorId)
  }
  return vendorRecord
}

const updateById = async (vendorId, payload, currentUser) => {
  const vendorRecord = await getById(vendorId, currentUser)
  await vendorRecord.update(payload)
}

const deleteById = async (vendorId, currentUser) => {
  const vendorRecord = await getById(vendorId, currentUser)
  await vendorRecord.destroy()
}

const vendorService = {
  create,
  createInternalVendor,
  getAll,
  getById,
  updateById,
  deleteById,
  getNames,
}

export default vendorService
