import type { ValidationError } from '@errors/api.error'
import investorsApi from '../api'
import type { InvestorFormValues } from '../types'
import { useState } from 'react'

type UseAddInvestorOpts = {
  onSuccess: () => void
}

const useAddInvestor = (opts: UseAddInvestorOpts) => {
  const [errors, setErrors] = useState<ValidationError[]>([])

  const clearError = () => {
    setErrors([])
  }

  const onSubmit = async (inputData: InvestorFormValues) => {
    const res = await investorsApi.create(inputData)
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

export default useAddInvestor
