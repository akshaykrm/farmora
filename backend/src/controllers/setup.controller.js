import setupService from '@services/setup.service'
import asyncHandler from '@utils/async-handler'
import logger from '@utils/logger'

const getStatus = async (req, res) => {
  const status = await setupService.getStatus(req.user)

  res.success(status, {
    message: 'Setup status fetched successfully',
  })
}

const generateDefaults = async (req, res) => {
  logger.info({ actor_id: req.user.id }, 'Generate default setup requested')
  const result = await setupService.generateDefaults(req.user)

  res.success(result, {
    message: 'Default setup generated successfully',
  })
}

const saveItems = async (req, res) => {
  const result = await setupService.saveItems(req.body, req.user)

  res.success(result, {
    message: 'Setup items saved successfully',
  })
}

const setupController = {
  getStatus: asyncHandler(getStatus),
  generateDefaults: asyncHandler(generateDefaults),
  saveItems: asyncHandler(saveItems),
}

export default setupController
