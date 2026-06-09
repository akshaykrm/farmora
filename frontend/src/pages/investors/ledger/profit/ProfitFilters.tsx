import { Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import FilterWrapper from '@components/filter-wrapper'
import SelectList from '@components/select-list'
import useLookupInvestors from '../hooks/useLookupInvestors'
import useLookupTransactionTypes from '../hooks/useLookupTransactionTypes'
import type { LedgerFilterRequest } from '../types'

type Props = {
  onFilter: (filter: LedgerFilterRequest) => void
}

const defaultValues: LedgerFilterRequest = {
  investor_id: '',
  transaction_type_id: '',
  start_date: '',
  end_date: '',
}

const ProfitFilters = ({ onFilter }: Props) => {
  const methods = useForm<LedgerFilterRequest>({ defaultValues })
  const { setValue, watch, handleSubmit } = methods
  const values = watch()
  const investors = useLookupInvestors()
  const types = useLookupTransactionTypes()

  const profitTypes = types.data.filter(
    (t) => t.category === 'PROFIT' || t.code === 'REVERSAL'
  )

  const handleApplyFilter = handleSubmit((inputData) => {
    onFilter(inputData)
  })

  return (
    <FilterWrapper>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <SelectList
          options={investors.data}
          value={values.investor_id ? Number(values.investor_id) : null}
          onChange={(val) => {
            setValue('investor_id', val ? String(val) : '')
          }}
          label="Investor"
          name="investor_id"
        />

        <SelectList
          options={profitTypes.map((t) => ({ id: t.id, name: t.name }))}
          value={
            values.transaction_type_id
              ? Number(values.transaction_type_id)
              : null
          }
          onChange={(val) => {
            setValue('transaction_type_id', val ? String(val) : '')
          }}
          label="Transaction Type"
          name="transaction_type_id"
        />

        <DatePicker
          label="Start Date"
          value={values.start_date ? dayjs(values.start_date) : null}
          format="DD-MM-YYYY"
          onChange={(v) => {
            setValue('start_date', v ? dayjs(v).toISOString() : '')
          }}
          slotProps={{
            textField: { fullWidth: true, size: 'small' },
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
            textField: { fullWidth: true, size: 'small' },
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button variant="contained" onClick={handleApplyFilter}>
          Apply Filters
        </Button>
      </div>
    </FilterWrapper>
  )
}

export default ProfitFilters
