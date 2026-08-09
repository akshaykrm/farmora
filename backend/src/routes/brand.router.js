import { Router } from 'express'
import brandController from '@controllers/brand.controller'
import { isAuthenticated } from '@middlewares/auth.middleware'

const router = Router()

router.use(isAuthenticated)

router.get('/names', brandController.getNames)

export default router
