import PageTitle from '@components/PageTitle'
import { useState } from 'react'
import { Button } from '@mui/material'
import { Dialog, DialogContent } from '@components/dialog'
import InvestTable from './InvestTable'
import InvestForm from './InvestForm'
import InvestFilters from './InvestFilters'
import ReversalDialog from '../ReversalDialog'
import useGetInvestorLedgerTransactions from '../hooks/useGetInvestorLedgerTransactions'
import useCreateInvestorTransaction from '../hooks/useCreateInvestorTransaction'
import type {
  InvestorTransactionFormValues,
  LedgerFilterRequest,
} from '../types'

const defaultFormValues: InvestorTransactionFormValues = {
  investor_id: '',
  transaction_type_code: '',
  amount: '',
  transaction_date: '',
  remarks: '',
}

const InvestPage = () => {
  const { transactionList, handleFetchTransactions } =
    useGetInvestorLedgerTransactions({ category: 'CAPITAL' })
  const [isOpen, setOpenAdd] = useState(false)
  const [isReversalOpen, setReversalOpen] = useState(false)
  const [reverseTransactionId, setReverseTransactionId] = useState<
    number | null
  >(null)

  const onOpen = () => setOpenAdd(true)
  const onClose = () => setOpenAdd(false)

  const { onSubmit, errors, clearError } = useCreateInvestorTransaction({
    onSuccess: () => {
      onClose()
      handleClose()
      handleFetchTransactions({ category: 'CAPITAL' })
    },
  })

  const handleClose = () => {
    setReversalOpen(false)
    setReverseTransactionId(null)
    clearError()
  }

  const onFilter = (filter: LedgerFilterRequest) => {
    const params: Record<string, string> = { category: 'CAPITAL' }
    if (filter.investor_id) params.investor_id = filter.investor_id
    if (filter.transaction_type_id)
      params.transaction_type_id = filter.transaction_type_id
    if (filter.start_date) params.start_date = filter.start_date
    if (filter.end_date) params.end_date = filter.end_date
    handleFetchTransactions(params)
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
      <InvestFilters onFilter={onFilter} />
      <div className="mt-4">
        <InvestTable
          onReverse={onReverse}
          data={transactionList}
        />
      </div>
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
