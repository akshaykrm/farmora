import type { ValidationError } from '@errors/api.error'
import { useCallback, useState } from 'react'
import type { UseEditInvestor, InvestorFormValues } from '../types'
import investorsApi from '../api'

const useEditInvestor: UseEditInvestor = (selectedId, opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([])

  const clearError = () => {
    setErrors([])
  }

  const onSubmit = useCallback(
    async (inputData: InvestorFormValues) => {
      if (!selectedId) return
      const res = await investorsApi.updateById(selectedId, inputData)
      if (res.status === 'success') {
        opts.onSuccess()
      } else if (res.status === 'validation_error') {
        setErrors(res.error)
      }
    },
    [selectedId],
  )

  return {
    onSubmit,
    errors,
    clearError,
  }
}

export default useEditInvestor
