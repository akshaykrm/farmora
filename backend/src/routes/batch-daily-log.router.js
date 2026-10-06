import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import batchDailyLogController from '@controllers/batch-daily-log.controller'
import validate, { validateQuery } from '@utils/validate-request'
import { exportQuerySchema } from '@validators/export.validator'
import {
  dailyLogSchema,
  logStartDateSchema,
  prefillQuerySchema,
  updateDailyLogSchema,
} from '@validators/batch-daily-log.validator'

const router = Router({ mergeParams: true })

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.batch_daily_log_read),
  batchDailyLogController.list
)

router.get(
  '/export',
  isAuthenticated,
  requirePermission(P.batch_daily_log_read, P.batch_daily_log_export),
  validateQuery(exportQuerySchema),
  batchDailyLogController.export
)

router.get(
  '/prefill',
  isAuthenticated,
  requirePermission(P.batch_daily_log_write),
  validateQuery(prefillQuerySchema),
  batchDailyLogController.prefill
)

router.put(
  '/start-date',
  isAuthenticated,
  requirePermission(P.batch_daily_log_edit),
  validate(logStartDateSchema),
  batchDailyLogController.setStartDate
)

router.post(
  '/',
  isAuthenticated,
  requirePermission(P.batch_daily_log_write),
  validate(dailyLogSchema),
  batchDailyLogController.create
)

router.put(
  '/:id',
  isAuthenticated,
  requirePermission(P.batch_daily_log_edit),
  validate(updateDailyLogSchema),
  batchDailyLogController.update
)

router.delete(
  '/:id',
  isAuthenticated,
  requirePermission(P.batch_daily_log_delete),
  batchDailyLogController.remove
)

export default router
