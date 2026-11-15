import createGeneralCategoryController from '@controllers/general-category.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import validate from '@utils/validate-request'
import { newGeneralCategorySchema } from '@validators/general-category.validator'
import { Router } from 'express'

// Mounted under /general-expenses/categories and /general-sales/categories,
// reusing each module's own permissions
const createGeneralCategoryRouter = (type, P) => {
  const controller = createGeneralCategoryController(type)
  const router = Router()

  router.use(isAuthenticated)
  router.get('/', requirePermission(P.read), controller.getAll)
  router.post(
    '/',
    requirePermission(P.write),
    validate(newGeneralCategorySchema),
    controller.create
  )
  router.put(
    '/:id',
    requirePermission(P.edit),
    validate(newGeneralCategorySchema),
    controller.updateById
  )
  router.delete('/:id', requirePermission(P.delete), controller.deleteById)

  return router
}

export default createGeneralCategoryRouter
