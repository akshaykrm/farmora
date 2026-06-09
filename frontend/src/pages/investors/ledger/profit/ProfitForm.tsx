import { Button, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useForm, type DefaultValues } from 'react-hook-form'
import { useEffect } from 'react'
import SelectList from '@components/select-list'
import type { ValidationError } from '@errors/api.error'
import type { InvestorTransactionFormValues } from '../types'
import useLookupInvestors from '../hooks/useLookupInvestors'
import useLookupTransactionTypes from '../hooks/useLookupTransactionTypes'

type Props = {
  onSubmit: (inputData: InvestorTransactionFormValues) => void
  defaultValues: DefaultValues<InvestorTransactionFormValues>
  apiError: ValidationError[]
  onCancel?: () => void
}

const ProfitForm = ({
  onSubmit,
  defaultValues,
  apiError,
  onCancel,
}: Props) => {
  const methods = useForm<InvestorTransactionFormValues>({ defaultValues })
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
    watch,
    clearErrors,
  } = methods
  const values = watch()
  const investors = useLookupInvestors()
  const types = useLookupTransactionTypes()

  const profitTypes = types.data.filter(
    (t) => t.category === 'PROFIT' || t.code === 'REVERSAL'
  )

  const isReversal = values.transaction_type_code === 'REVERSAL'

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name as keyof InvestorTransactionFormValues, { message })
      })
    }
  }, [apiError, setError])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4">
        <SelectList
          options={investors.data}
          value={values.investor_id ? Number(values.investor_id) : null}
          onChange={(val) => {
            setValue('investor_id', val ? val : '')
            clearErrors('investor_id')
          }}
          label="Investor"
          name="investor_id"
          error={Boolean(errors.investor_id)}
          helperText={errors.investor_id?.message}
        />

        <SelectList
          options={profitTypes.map((t) => ({
            id: t.id,
            name: t.name,
          }))}
          value={null}
          onChange={(val) => {
            const selected = profitTypes.find((t) => t.id === val)
            setValue('transaction_type_code', selected ? selected.code : '')
            clearErrors('transaction_type_code')
          }}
          label="Transaction Type"
          name="transaction_type_code"
          error={Boolean(errors.transaction_type_code)}
          helperText={errors.transaction_type_code?.message}
        />

        <TextField
          label="Amount"
          fullWidth
          type="number"
          error={Boolean(errors.amount)}
          helperText={errors.amount?.message}
          {...register('amount')}
          size="small"
        />

        <DatePicker
          label="Transaction Date"
          value={values.transaction_date ? dayjs(values.transaction_date) : null}
          format="DD-MM-YYYY"
          onChange={(v) => {
            setValue('transaction_date', v ? dayjs(v).toISOString() : '')
            clearErrors('transaction_date')
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              error: Boolean(errors.transaction_date),
              helperText: errors.transaction_date?.message,
            },
          }}
        />

        <TextField
          label="Remarks"
          fullWidth
          multiline
          rows={2}
          {...register('remarks')}
          size="small"
        />
      </div>

      <div className="flex justify-end mt-6 gap-2">
        {onCancel && (
          <Button variant="outlined" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="contained" type="submit">
          {isReversal ? 'Reverse Transaction' : 'Submit'}
        </Button>
      </div>
    </form>
  )
}

export default ProfitForm
