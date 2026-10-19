import { Router } from 'express'
import { authorize, isAuthenticated } from '@middlewares/auth.middleware'
import asyncHandler from '@utils/async-handler'
import userRoles from '@utils/user-roles'
import validate from '@utils/validate-request'
import { setupItemsSchema } from '@validators/setup.validator'
import setupController from '@controllers/setup.controller'

const router = Router()

const isManager = asyncHandler(authorize(userRoles.manager.type))

router.get('/status', isAuthenticated, isManager, setupController.getStatus)

router.post(
  '/generate',
  isAuthenticated,
  isManager,
  setupController.generateDefaults
)

router.post(
  '/items',
  isAuthenticated,
  isManager,
  validate(setupItemsSchema),
  setupController.saveItems
)

export default router
