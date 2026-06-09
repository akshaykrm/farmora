import { isAuthenticated, isManagerOrAdmin } from '@middlewares/auth.middleware'
import { Router } from 'express'
import LedgerController from './ledger.controller'
import validate from '@utils/validate-request'
import { createInvestorTransactionSchema } from './ledger.validation'

const router = Router()

router.post(
  '/',
  validate(createInvestorTransactionSchema),
  isAuthenticated,
  isManagerOrAdmin,
  LedgerController.createTransaction
)

router.get(
  '/lookup/investors',
  isAuthenticated,
  isManagerOrAdmin,
  LedgerController.lookupInvestors
)

router.get(
  '/lookup/transaction-types',
  isAuthenticated,
  LedgerController.lookupTransactionTypes
)

router.get(
  '/balances/capital',
  isAuthenticated,
  isManagerOrAdmin,
  LedgerController.getCapitalBalance
)

router.get(
  '/balances/profit',
  isAuthenticated,
  isManagerOrAdmin,
  LedgerController.getProfitBalance
)

router.get(
  '/',
  isAuthenticated,
  isManagerOrAdmin,
  LedgerController.listTransactions
)

router.get(
  '/:transaction_id',
  isAuthenticated,
  isManagerOrAdmin,
  LedgerController.getTransactionById
)

export default router
