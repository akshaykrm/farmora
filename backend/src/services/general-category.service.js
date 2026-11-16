import GeneralCategoryModel from '@models/generalcategory'
import GeneralExpenseModel from '@models/generalexpense'
import ExpenseSalesModel from '@models/expensesales'
import { getMasterId } from '@services/permission.service'
import { sequelize } from '@utils/db'
import { Op, where, fn, col } from 'sequelize'
import {
  GeneralCategoryDuplicateError,
  GeneralCategoryInUseError,
  GeneralCategoryNotFoundError,
} from '@errors/general-category.errors'

const RECORD_MODELS = {
  expense: GeneralExpenseModel,
  sale: ExpenseSalesModel,
}

const getAll = async (type, filter, currentUser) => {
  const whereClause = { type, master_id: getMasterId(currentUser) }
  if (filter.status) {
    whereClause.status = filter.status
  }
  if (filter.name) {
    whereClause.name = { [Op.iLike]: `%${filter.name}%` }
  }
  return GeneralCategoryModel.findAll({
    where: whereClause,
    order: [['name', 'ASC']],
  })
}

const getById = async (type, id, currentUser) => {
  const record = await GeneralCategoryModel.findOne({
    where: { id, type, master_id: getMasterId(currentUser) },
  })
  if (!record) {
    throw new GeneralCategoryNotFoundError()
  }
  return record
}

const assertUniqueName = async (type, name, currentUser, excludeId) => {
  const clause = {
    type,
    master_id: getMasterId(currentUser),
    [Op.and]: [where(fn('LOWER', col('name')), name.toLowerCase())],
  }
  if (excludeId) {
    clause.id = { [Op.ne]: excludeId }
  }
  const existing = await GeneralCategoryModel.findOne({ where: clause })
  if (existing) {
    throw new GeneralCategoryDuplicateError()
  }
}

const create = async (type, payload, currentUser) => {
  await assertUniqueName(type, payload.name, currentUser)
  return GeneralCategoryModel.create({
    type,
    name: payload.name,
    status: payload.status || 'active',
    master_id: getMasterId(currentUser),
  })
}

const updateById = async (type, id, payload, currentUser) => {
  const record = await getById(type, id, currentUser)
  await assertUniqueName(type, payload.name, currentUser, record.id)

  await sequelize.transaction(async (transaction) => {
    await record.update(
      { name: payload.name, status: payload.status || record.status },
      { transaction }
    )
    // records keep a copy of the name in `purpose` for reports and exports
    await RECORD_MODELS[type].update(
      { purpose: payload.name },
      { where: { category_id: record.id }, transaction }
    )
  })
  return record
}

const deleteById = async (type, id, currentUser) => {
  const record = await getById(type, id, currentUser)
  const used = await RECORD_MODELS[type].count({
    where: { category_id: record.id },
  })
  if (used > 0) {
    throw new GeneralCategoryInUseError()
  }
  await record.destroy()
}

// Resolves the category for an expense/sale payload and copies its name into
// `purpose`. Payloads without category_id (older clients) keep their purpose.
const applyCategory = async (type, payload, masterId) => {
  if (!payload.category_id) {
    return payload.purpose ? { ...payload, category_id: null } : payload
  }
  const category = await GeneralCategoryModel.findOne({
    where: { id: payload.category_id, type, master_id: masterId },
  })
  if (!category) {
    throw new GeneralCategoryNotFoundError()
  }
  return { ...payload, purpose: category.name }
}

const generalCategoryService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  applyCategory,
}

export default generalCategoryService
