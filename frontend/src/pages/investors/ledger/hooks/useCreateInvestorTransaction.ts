import { useState } from 'react'
import type { ValidationError } from '@errors/api.error'
import type { InvestorTransactionFormValues } from '../types'
import investorLedgerApi from '../api'

type UseCreateInvestorTransactionOpts = {
  onSuccess: () => void
}

const useCreateInvestorTransaction = (
  opts: UseCreateInvestorTransactionOpts
) => {
  const [errors, setErrors] = useState<ValidationError[]>([])

  const clearError = () => {
    setErrors([])
  }

  const onSubmit = async (inputData: InvestorTransactionFormValues) => {
    const res = await investorLedgerApi.createTransaction(inputData)
    if (res.status === 'success') {
      opts.onSuccess()
    } else if (res.status === 'validation_error') {
      setErrors(res.error)
    }
  }

  return {
    onSubmit,
    errors,
    clearError,
  }
}

export default useCreateInvestorTransaction
