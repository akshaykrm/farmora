import generalCategoryService from '@services/general-category.service'
import asyncHandler from '@utils/async-handler'

const createGeneralCategoryController = (type) => ({
  getAll: asyncHandler(async (req, res) => {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.name) filter.name = req.query.name
    const records = await generalCategoryService.getAll(type, filter, req.user)
    res.success(records, { message: 'Categories retrieved successfully' })
  }),
  create: asyncHandler(async (req, res) => {
    const record = await generalCategoryService.create(type, req.body, req.user)
    res.success(record, {
      message: 'Category created successfully',
      statusCode: 201,
    })
  }),
  updateById: asyncHandler(async (req, res) => {
    const record = await generalCategoryService.updateById(
      type,
      req.params.id,
      req.body,
      req.user
    )
    res.success(record, { message: 'Category updated successfully' })
  }),
  deleteById: asyncHandler(async (req, res) => {
    await generalCategoryService.deleteById(type, req.params.id, req.user)
    res.success(null, {
      message: 'Category deleted successfully',
      statusCode: 204,
    })
  }),
})

export default createGeneralCategoryController
