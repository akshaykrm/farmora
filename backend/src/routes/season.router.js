import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import seasonController from '@controllers/season.controller'
import validate from '@utils/validate-request'
import {
  newSeasonSchema,
  updateSeasonSchema,
} from '@validators/season.validator'

const router = Router()

router.use(isAuthenticated)

router.post(
  '/',
  validate(newSeasonSchema),
  requirePermission(P.season_write),
  seasonController.create
)

router.get('/', requirePermission(P.season_read), seasonController.getAll)

router.get(
  '/names',
  requirePermission(P.season_read),
  seasonController.getNames
)

router.get(
  '/:season_id',
  requirePermission(P.season_read),
  seasonController.getById
)
router.put(
  '/:season_id',
  validate(updateSeasonSchema),
  requirePermission(P.season_edit),
  seasonController.updateById
)

router.put(
  '/:season_id/close',
  requirePermission(P.season_edit),
  seasonController.close
)

router.delete(
  '/:season_id',
  requirePermission(P.season_delete),
  seasonController.deleteById
)

export default router
