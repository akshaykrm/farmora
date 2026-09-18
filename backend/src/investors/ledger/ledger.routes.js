import { isAuthenticated, requirePermission } from '@middlewares/auth.middleware'
import { PERMISSION_KEYS as P } from '../../../config/permissions.js'
import { Router } from 'express'
import LedgerController from './ledger.controller'
import validate from '@utils/validate-request'
import { createInvestorTransactionSchema } from './ledger.validation'

const router = Router()

router.post(
  '/',
  validate(createInvestorTransactionSchema),
  isAuthenticated,
  requirePermission(P.investor_ledger_write),
  LedgerController.createTransaction
)

router.get(
  '/lookup/investors',
  isAuthenticated,
  requirePermission(P.investor_ledger_read),
  LedgerController.lookupInvestors
)

router.get(
  '/lookup/transaction-types',
  isAuthenticated,
  requirePermission(P.investor_ledger_read),
  LedgerController.lookupTransactionTypes
)

router.get(
  '/balances/capital',
  isAuthenticated,
  requirePermission(P.investor_ledger_read),
  LedgerController.getCapitalBalance
)

router.get(
  '/balances/profit',
  isAuthenticated,
  requirePermission(P.investor_ledger_read),
  LedgerController.getProfitBalance
)

router.get(
  '/summary',
  isAuthenticated,
  requirePermission(P.investor_ledger_read),
  LedgerController.getBalanceSummary
)

router.get(
  '/',
  isAuthenticated,
  requirePermission(P.investor_ledger_read),
  LedgerController.listTransactions
)

router.get(
  '/:transaction_id',
  isAuthenticated,
  requirePermission(P.investor_ledger_read),
  LedgerController.getTransactionById
)

export default router
