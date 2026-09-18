import { Router } from 'express'
import batchController from '@controllers/configuration.controller'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import {
  newBatchSchema,
  updateBatchSchema,
  addBatchLogSchema,
} from '@validators/batch.validator'

const router = Router()

router.post(
  '/',
  validate(newBatchSchema),
  isAuthenticated,
  requirePermission(P.batch_write),
  batchController.create
)

router.get(
  '/names',
  isAuthenticated,
  requirePermission(P.batch_read),
  batchController.getNames
)

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.batch_read),
  batchController.getAll
)
router.get(
  '/count/:farm_id',
  isAuthenticated,
  requirePermission(P.batch_read),
  batchController.getCount
)

router.get(
  '/:batch_id',
  isAuthenticated,
  requirePermission(P.batch_read),
  batchController.getById
)

router.put(
  '/:batch_id',
  isAuthenticated,
  validate(updateBatchSchema),
  requirePermission(P.batch_edit),
  batchController.updateById
)

router.put(
  '/:batch_id/close',
  isAuthenticated,
  requirePermission(P.batch_edit),
  batchController.close
)

router.put(
  '/:batch_id/logs',
  isAuthenticated,
  requirePermission(P.batch_edit),
  validate(addBatchLogSchema),
  batchController.addBatchLog
)

router.delete(
  '/:batch_id',
  isAuthenticated,
  requirePermission(P.batch_delete),
  batchController.deleteById
)

export default router
