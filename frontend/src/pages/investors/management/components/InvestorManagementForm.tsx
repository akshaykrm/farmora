import { Button, FormControlLabel, Switch, TextField } from '@mui/material'
import { useForm, type DefaultValues } from 'react-hook-form'
import type { InvestorFormValues } from '../types'
import type { ValidationError } from '@errors/api.error'
import { useEffect } from 'react'

type Props = {
  onSubmit: (inputData: InvestorFormValues) => void
  defaultValues: DefaultValues<InvestorFormValues>
  apiError: ValidationError[]
  onCancel?: () => void
}

const InvestorManagementForm = ({
  onSubmit,
  defaultValues,
  apiError,
  onCancel,
}: Props) => {
  const methods = useForm<InvestorFormValues>({ defaultValues })

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    control,
  } = methods

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name, { message })
      })
    }
  }, [apiError])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4">
        <TextField
          label="Investor Name"
          fullWidth
          error={Boolean(errors.investor_name)}
          helperText={errors.investor_name?.message}
          {...register('investor_name')}
          size="small"
        />

        <TextField
          label="Investor Phone"
          fullWidth
          error={Boolean(errors.investor_phone)}
          helperText={errors.investor_phone?.message}
          {...register('investor_phone')}
          size="small"
        />

        <TextField
          label="Investor Email"
          fullWidth
          error={Boolean(errors.investor_email)}
          helperText={errors.investor_email?.message}
          {...register('investor_email')}
          size="small"
        />

        <FormControlLabel
          control={
            <Switch
              defaultChecked
              {...register('is_active')}
            />
          }
          label="Active"
        />
      </div>
      <div className="flex justify-end mt-6 gap-2">
        {onCancel && (
          <Button variant="outlined" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </div>
    </form>
  )
}

export default InvestorManagementForm
