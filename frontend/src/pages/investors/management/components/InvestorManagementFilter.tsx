import { Button, Card, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import FilterWrapper from '@components/filter-wrapper'
import type { InvestorFilterRequest } from '../types'

type Props = {
  onFilter: (filter: InvestorFilterRequest) => void
}

const defaultValues: InvestorFilterRequest = {
  search: '',
  start_date: '',
  end_date: '',
}

const InvestorManagementFilter = ({ onFilter }: Props) => {
  const methods = useForm<InvestorFilterRequest>({
    defaultValues,
  })

  const { register, setValue, watch, handleSubmit } = methods
  const values = watch()

  const handleApplyFilter = handleSubmit((inputData) => {
    onFilter(inputData)
  })

  return (
    <Card>
      <FilterWrapper>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <TextField
            label="Search by name, phone or email"
            size="small"
            fullWidth
            {...register('search')}
          />

          <DatePicker
            label="Start Date"
            value={values.start_date ? dayjs(values.start_date) : null}
            format="DD-MM-YYYY"
            onChange={(v) => {
              setValue('start_date', v ? dayjs(v).toISOString() : '')
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
          />

          <DatePicker
            label="End Date"
            value={values.end_date ? dayjs(values.end_date) : null}
            format="DD-MM-YYYY"
            onChange={(v) => {
              setValue('end_date', v ? dayjs(v).toISOString() : '')
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button variant="contained" onClick={handleApplyFilter}>
            Apply Filters
          </Button>
        </div>
      </FilterWrapper>
    </Card>
  )
}

export default InvestorManagementFilter
