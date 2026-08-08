import { Router } from 'express'
import batchController from '@controllers/configuration.controller'
import { isAuthenticated, isManagerOrAdmin } from '@middlewares/auth.middleware'
import validate from '@utils/validate-request'
import { newBatchSchema, updateBatchSchema } from '@validators/batch.validator'

const router = Router()

// TODO: Need to fix the CRUD operations for batches, there are few errors
router.post(
  '/',
  validate(newBatchSchema),
  isAuthenticated,
  isManagerOrAdmin,
  batchController.create
)

router.get(
  '/names',
  isAuthenticated,
  isManagerOrAdmin,
  batchController.getNames
)

router.get('/', isAuthenticated, isManagerOrAdmin, batchController.getAll)
router.get(
  '/count/:farm_id',
  isAuthenticated,
  isManagerOrAdmin,
  batchController.getCount
)

router.get(
  '/:batch_id',
  isAuthenticated,
  isManagerOrAdmin,
  batchController.getById
)

router.put(
  '/:batch_id',
  isAuthenticated,
  validate(updateBatchSchema),
  isManagerOrAdmin,
  batchController.updateById
)

router.put(
  '/:batch_id/close',
  isAuthenticated,
  isManagerOrAdmin,
  batchController.close
)

router.delete(
  '/:batch_id',
  isAuthenticated,
  isManagerOrAdmin,
  batchController.deleteById
)

export default router
