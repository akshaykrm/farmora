import { Router } from 'express'
import brandController from '@controllers/brand.controller'
import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import { newBrandSchema } from '@validators/brand.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/names', requirePermission(P.item_read), brandController.getNames)

router.post(
  '/',
  requirePermission(P.item_write),
  validate(newBrandSchema),
  brandController.create
)

export default router
