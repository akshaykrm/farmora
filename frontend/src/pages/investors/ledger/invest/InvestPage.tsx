import PageTitle from '@components/PageTitle'
import { useState } from 'react'
import { Box, Button } from '@mui/material'
import { Dialog, DialogContent } from '@components/dialog'
import PaginationWithLimit from '@components/pagination-with-limit'
import InvestTable from './InvestTable'
import InvestForm from './InvestForm'
import InvestFilters from './InvestFilters'
import ReversalDialog from '../ReversalDialog'
import BalanceCard from '../BalanceCard'
import useGetInvestorLedgerTransactions from '../hooks/use-get-investor-ledger-transactions'
import useCreateInvestorTransaction from '../hooks/useCreateInvestorTransaction'
import useGetBalanceSummary from '../hooks/useGetBalanceSummary'
import useLedgerFilter from '../hooks/use-ledger-filter'
import type { InvestorTransactionFormValues } from '../types'

const defaultFormValues: InvestorTransactionFormValues = {
  investor_id: '',
  transaction_type_code: '',
  amount: '',
  transaction_date: '',
  remarks: '',
}

const InvestPage = () => {
  const { filter, updateQueryParams } = useLedgerFilter()
  const { transactions } =
    useGetInvestorLedgerTransactions({ ...filter, category: 'CAPITAL' })
  const [isOpen, setOpenAdd] = useState(false)
  const [isReversalOpen, setReversalOpen] = useState(false)
  const [reverseTransactionId, setReverseTransactionId] = useState<
    number | null
  >(null)

  const { balance, loading, refetch: refetchBalance } = useGetBalanceSummary({
    category: 'CAPITAL',
    investorId: filter.investor_id || undefined,
    startDate: filter.start_date || undefined,
    endDate: filter.end_date || undefined,
  })

  const onOpen = () => setOpenAdd(true)
  const onClose = () => setOpenAdd(false)

  const { onSubmit, errors, clearError } = useCreateInvestorTransaction({
    onSuccess: () => {
      onClose()
      handleClose()
      updateQueryParams({ page: 1 })
      refetchBalance()
    },
  })

  const handleClose = () => {
    setReversalOpen(false)
    setReverseTransactionId(null)
    clearError()
  }

  const onReverse = (transactionId: number) => {
    setReverseTransactionId(transactionId)
    setReversalOpen(true)
  }

  const onReversalSubmit = (inputData: InvestorTransactionFormValues) => {
    onSubmit(inputData)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Investments" />
        <Button variant="contained" onClick={onOpen}>
          Add Investment
        </Button>
      </div>
      <InvestFilters defaultFilter={filter} onFilter={(f) => updateQueryParams(f)} />
      <div className="mt-4">
        <BalanceCard
          balance={balance}
          loading={loading}
          category="CAPITAL"
          hasInvestorFilter={Boolean(filter.investor_id)}
          filterStartDate={filter.start_date}
          filterEndDate={filter.end_date}
        />
      </div>
      <div className="mt-4">
        <InvestTable
          onReverse={onReverse}
          transactions={transactions.records}
        />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={transactions.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <Dialog
        isOpen={isOpen}
        headerTitle="Add Investment"
        onClose={onClose}
      >
        <DialogContent>
          <InvestForm
            onSubmit={onSubmit}
            defaultValues={defaultFormValues}
            apiError={errors}
            onCancel={onClose}
          />
        </DialogContent>
      </Dialog>
      <ReversalDialog
        transactionId={reverseTransactionId}
        isOpen={isReversalOpen}
        onClose={handleClose}
        onSubmit={onReversalSubmit}
      />
    </>
  )
}

export default InvestPage
