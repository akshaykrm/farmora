import { Router } from 'express'
import brandController from '@controllers/brand.controller'
import { isAuthenticated } from '@middlewares/auth.middleware'
import validate from '@utils/validate-request'
import { newBrandSchema } from '@validators/brand.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/names', brandController.getNames)

router.post('/', validate(newBrandSchema), brandController.create)

export default router
