import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import batchDailyLogController from '@controllers/batch-daily-log.controller'

const router = Router()

router.get(
  '/open-batches',
  isAuthenticated,
  requirePermission(P.batch_daily_log_read),
  batchDailyLogController.openBatches
)

export default router
