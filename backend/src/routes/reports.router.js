import { Router } from 'express'
import { isAuthenticated, isSuperAdmin } from '@middlewares/auth.middleware'
import { validateQuery } from '@utils/validate-request'
import { exportQuerySchema } from '@validators/export.validator'
import reportsController from '@controllers/reports.controller'

const router = Router()

router.use(isAuthenticated)

router.get('/', reportsController.list)

router.get('/companies', isSuperAdmin, reportsController.companies)

router.get('/options', reportsController.options)

router.get(
  '/:key/export',
  validateQuery(exportQuerySchema),
  reportsController.export
)

router.get('/:key', reportsController.view)

export default router
