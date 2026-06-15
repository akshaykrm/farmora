import type { ListResponse } from '@app-types/response.types'
import type { ValidationError } from '@errors/api.error'

export type TransactionType = {
  id: number
  code: string
  name: string
  category: string
}

export type InvestorTransaction = {
  id: number
  txn_id: string
  master_id: number
  investor_id: number
  transaction_type_id: number
  amount: string
  transaction_date: string
  reference_transaction_id: number | null
  remarks: string | null
  createdAt: string
  updatedAt: string
  investor?: {
    id: number
    investor_name: string
  }
  transaction_type?: TransactionType
}

export type InvestorTransactionListResponse = ListResponse<InvestorTransaction>

export type InvestorTransactionFormValues = {
  investor_id: number | ''
  transaction_type_code: string
  amount: string
  transaction_date: string
  remarks: string
  reference_transaction_id?: number | null
}

export type LedgerFilterRequest = {
  investor_id?: string
  transaction_type_id?: string
  start_date?: string
  end_date?: string
  page?: string
  limit?: string
  category?: string
}

export type UseCreateInvestorTransaction = (opts: {
  onSuccess: () => void
}) => {
  onSubmit: (inputData: InvestorTransactionFormValues) => Promise<void>
  errors: ValidationError[]
  clearError: () => void
}
