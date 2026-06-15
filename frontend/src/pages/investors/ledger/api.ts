import fetcherV2 from '@utils/fetcherV2'
import type { InvestorTransaction, InvestorTransactionFormValues, InvestorTransactionListResponse } from './types'
import type { NameResponse } from '@app-types/gen.types'

const investorLedgerApi = {
  listTransactions: (filter?: Record<string, string>) =>
    fetcherV2<InvestorTransactionListResponse>('investors/ledger', null, {
      method: 'GET',
      filter,
    }),

  getTransactionById: (id: number) =>
    fetcherV2<InvestorTransaction>(`investors/ledger/${id}`),

  createTransaction: (payload: InvestorTransactionFormValues) =>
    fetcherV2<unknown>('investors/ledger', JSON.stringify(payload), {
      method: 'POST',
    }),

  lookupInvestors: () =>
    fetcherV2<NameResponse[]>('investors/ledger/lookup/investors'),

  lookupTransactionTypes: () =>
    fetcherV2<InvestorTransaction[]>('investors/ledger/lookup/transaction-types'),

  getBalanceSummary: (params: Record<string, string>) =>
    fetcherV2<{ balance: number }>('investors/ledger/summary', null, {
      method: 'GET',
      filter: params,
    }),

  getCapitalBalance: (investorId: number) =>
    fetcherV2<{ balance: number }>(
      `investors/ledger/balances/capital?investor_id=${investorId}`
    ),

  getProfitBalance: (investorId: number) =>
    fetcherV2<{ balance: number }>(
      `investors/ledger/balances/profit?investor_id=${investorId}`
    ),
}

export default investorLedgerApi
