import { Router } from 'express'
import {
  isAuthenticated,
  requirePermission,
} from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../config/permissions.js'
import validate from '@utils/validate-request'
import referralController from './referral.controller.js'
import {
  createReferralPartnerSchema,
  updateReferralPartnerSchema,
  referralPaymentSchema,
  linkCompanySchema,
} from './referral.validation.js'

const router = Router()

router.use(isAuthenticated)

router.post(
  '/',
  validate(createReferralPartnerSchema),
  requirePermission(P.referral_write),
  referralController.create
)

router.get('/', requirePermission(P.referral_read), referralController.getAll)

router.get(
  '/:partner_id',
  requirePermission(P.referral_read),
  referralController.getById
)

router.put(
  '/:partner_id',
  validate(updateReferralPartnerSchema),
  requirePermission(P.referral_edit),
  referralController.updateById
)

router.get(
  '/:partner_id/ledger',
  requirePermission(P.referral_ledger_read),
  referralController.getLedger
)

router.post(
  '/:partner_id/payments',
  validate(referralPaymentSchema),
  requirePermission(P.referral_ledger_write),
  referralController.recordPayment
)

router.post(
  '/:partner_id/link-company',
  validate(linkCompanySchema),
  requirePermission(P.referral_edit),
  referralController.linkCompany
)

export default router
