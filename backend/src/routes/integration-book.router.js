import integrationBookController from '@controllers/integration-book'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import { newIntegationBookSchema } from '@validators/itengration-book.validator'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.integration_book_read),
  integrationBookController.getAll
)

router.post(
  '/',
  isAuthenticated,
  requirePermission(P.integration_book_write),
  validate(newIntegationBookSchema),
  integrationBookController.create
)

export default router
