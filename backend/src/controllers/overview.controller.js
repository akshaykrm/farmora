import overviewService from '@services/overview.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'

const getBatchOverview = async (req, res) => {
  const filter = {
    batch_id: parseInt(req.query.batch_id),

    e_page: parseInt(req.query.e_page) || 1,
    e_limit: parseInt(req.query.e_limit) || 10,

    r_page: parseInt(req.query.r_page) || 1,
    r_limit: parseInt(req.query.r_limit) || 10,

    s_page: parseInt(req.query.s_page) || 1,
    s_limit: parseInt(req.query.s_limit) || 10,
  }

  const overviewData = await overviewService.getBatchOverview(filter, req.user)

  res.success(overviewData, {
    message: 'Batch overview fetched successfully',
  })
}

const getSeasonOverview = async (req, res) => {
  const filter = {
    season_id: parseInt(req.query.season_id),

    b_page: parseInt(req.query.b_page) || 1,
    b_limit: parseInt(req.query.b_limit) || 10,

    gc_page: parseInt(req.query.gc_page) || 1,
    gc_limit: parseInt(req.query.gc_limit) || 10,

    gs_page: parseInt(req.query.gs_page) || 1,
    gs_limit: parseInt(req.query.gs_limit) || 10,
  }

  logger.info({ filter }, 'Season overview request received')
  const overviewData = await overviewService.getSeasonOverview(filter, req.user)

  res.success(overviewData, {
    message: 'Season overview fetched successfully',
  })
}

const overviewController = {
  getBatchOverview: asyncHandler(getBatchOverview),
  getSeasonOverview: asyncHandler(getSeasonOverview),
}

export default overviewController
