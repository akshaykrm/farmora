import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import { Router } from 'express'
import overviewController from '@controllers/overview.controller'
import overviewExportController from '@controllers/overview-export.controller'
import { validateQuery } from '@utils/validate-request'
import {
  batchOverviewExportQuerySchema,
  seasonOverviewExportQuerySchema,
} from '@validators/export.validator'

const router = Router()

router.get(
  '/batch',
  isAuthenticated,
  requirePermission(P.batch_overview_read),
  overviewController.getBatchOverview
)

router.get(
  '/batch/export',
  isAuthenticated,
  requirePermission(P.batch_overview_read, P.batch_overview_export),
  validateQuery(batchOverviewExportQuerySchema),
  overviewExportController.batchOverview
)

router.get(
  '/season',
  isAuthenticated,
  requirePermission(P.season_overview_read),
  overviewController.getSeasonOverview
)

router.get(
  '/season/export',
  isAuthenticated,
  requirePermission(P.season_overview_read, P.season_overview_export),
  validateQuery(seasonOverviewExportQuerySchema),
  overviewExportController.seasonOverview
)

export default router
