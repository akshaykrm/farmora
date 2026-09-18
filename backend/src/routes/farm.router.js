import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import farmController from '@controllers/farm.controller'
import { newFarmSchema, updateFarmSchema } from '@validators/farm.validator'
import validate from '@utils/validate-request'

const router = Router()

router.post(
  '/',
  isAuthenticated,
  validate(newFarmSchema),
  requirePermission(P.farm_write),
  farmController.create
)
router.get(
  '/',
  isAuthenticated,
  requirePermission(P.farm_read),
  farmController.getAll
)

router.get(
  '/names',
  isAuthenticated,
  requirePermission(P.farm_read),
  farmController.getNames
)

router.get(
  '/:farm_id',
  isAuthenticated,
  requirePermission(P.farm_read),
  farmController.getById
)
router.put(
  '/:farm_id',
  isAuthenticated,
  validate(updateFarmSchema),
  requirePermission(P.farm_edit),
  farmController.updateById
)
router.delete(
  '/:farm_id',
  isAuthenticated,
  requirePermission(P.farm_delete),
  farmController.deletById
)

export default router
