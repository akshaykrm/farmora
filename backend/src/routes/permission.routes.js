import permissionController from '@controllers/permission.controller'
import { isAuthenticated } from '@middlewares/auth.middleware'
import { Router } from 'express'

const router = Router()

router.get('/', isAuthenticated, permissionController.getAllPermissions)

export default router
