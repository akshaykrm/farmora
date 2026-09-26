import BrandModel from '@models/brand'
import UserModel from '@models/user'
import userRoles from '@utils/user-roles'
import { getMasterId } from '@services/permission.service'
import { Op, UniqueConstraintError } from 'sequelize'

// null means no tenant scoping, i.e. admins see brands of every owner
const visibleMasterFilter = async (currentUser) => {
  if (currentUser.user_type === userRoles.admin.type) return null

  const adminOwners = await UserModel.findAll({
    where: { user_type: userRoles.admin.type },
    attributes: ['id'],
  })

  return {
    [Op.in]: [
      getMasterId(currentUser),
      ...adminOwners.map((admin) => admin.id),
    ],
  }
}

const getNames = async (currentUser) => {
  const filter = { status: 'active' }

  const masterFilter = await visibleMasterFilter(currentUser)
  if (masterFilter) {
    filter.master_id = masterFilter
  }

  const records = await BrandModel.findAll({
    where: filter,
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })
  return records
}

const create = async (payload, currentUser) => {
  const masterId = getMasterId(currentUser)
  const masterFilter = await visibleMasterFilter(currentUser)

  // reuse a brand the caller can already see, so the same name is not
  // listed twice in the dropdown
  if (masterFilter) {
    const existing = await BrandModel.findOne({
      where: { name: payload.name, master_id: masterFilter },
    })
    if (existing) return existing
  }

  try {
    const [record] = await BrandModel.findOrCreate({
      where: { name: payload.name, master_id: masterId },
      defaults: { name: payload.name, status: 'active', master_id: masterId },
    })
    return record
  } catch (error) {
    // name is still globally unique, so another tenant may hold it
    if (error instanceof UniqueConstraintError) {
      const [existing] = await BrandModel.findOrCreate({
        where: { name: payload.name },
        defaults: { name: payload.name, status: 'active', master_id: masterId },
      })
      return existing
    }
    throw error
  }
}

const brandService = {
  getNames,
  create,
}

export default brandService
