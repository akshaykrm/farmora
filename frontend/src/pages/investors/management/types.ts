import type { ListResponse } from '@app-types/response.types'
import type { ValidationError } from '@errors/api.error'

export type Investor = {
  id: number
  master_id: number
  investor_name: string
  investor_phone: string
  investor_email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InvestorDetail = Investor

export type InvestorFormValues = {
  investor_name: string
  investor_phone: string
  investor_email: string
  is_active: boolean
}

export type InvestorListResponse = ListResponse<Investor>

type UseInvestorReturn = {
  onSubmit: (inputData: InvestorFormValues) => void
  errors: ValidationError[]
  clearError: () => void
}

type Opts = {
  onSuccess: () => void
}

export type InvestorFilterRequest = {
  search: string
  start_date: string
  end_date: string
}

export type UseAddInvestor = (opts: Opts) => UseInvestorReturn

export type UseEditInvestor = (
  selectedId: number | null,
  opts: Opts,
) => UseInvestorReturn
