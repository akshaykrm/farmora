import { VendorNotFoundError } from '@errors/vendor.errors'
import VendorModel from '@models/vendor'
import userRoles from '@utils/user-roles'
import { Op } from 'sequelize'

const create = async (payload, currentUser) => {
  payload.master_id = currentUser.id
  payload.status = 'active'
  const newVendor = await VendorModel.create(payload)
  return newVendor
}

const createInternalVendor = async (currentUser) => {
  const newVendor = {
    name: 'Internal',
    vendor_type: 'supplier',
    address: 'nil',
    opening_balance: 0,
    status: 'active',
  }
  return create(newVendor, currentUser)
}

const getNames = async (filter, currentUser) => {
  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const records = await VendorModel.findAll({
    where: filter,
    attributes: ['id', 'name', 'vendor_type'],
    limit: 50,
  })
  return records
}

const getAll = async (payload, currentUser) => {
  const { page, limit, ...filter } = payload
  const offset = (page - 1) * limit

  if (filter.name) {
    filter.name = { [Op.iLike]: `%${filter.name}%` }
  }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

  const { count, rows } = await VendorModel.findAndCountAll({
    where: filter,
    limit,
    offset,
    order: [['id', 'DESC']],
  })

  return {
    page,
    limit,
    total: count,
    data: rows,
  }
}

const getById = async (vendorId, currentUser) => {
  const filter = { id: vendorId }

  if (currentUser.user_type === userRoles.manager.type) {
    filter.master_id = currentUser.id
  }

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
