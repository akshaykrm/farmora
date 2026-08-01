import { Button, TextField } from '@mui/material'
import { Dialog, DialogContent } from '@components/dialog'
import dayjs from 'dayjs'
import { useState } from 'react'
import useGetTransactionById from './hooks/useGetTransactionById'
import type { InvestorTransactionFormValues } from './types'

type Props = {
  transactionId: number | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (inputData: InvestorTransactionFormValues) => void
}

const ReversalDialog = ({
  transactionId,
  isOpen,
  onClose,
  onSubmit,
}: Props) => {
  const { transaction, loading } = useGetTransactionById(transactionId)
  const [remarks, setRemarks] = useState('')
  const [confirmationText, setConfirmationText] = useState('')

  const handleClose = () => {
    setRemarks('')
    setConfirmationText('')
    onClose()
  }

  const handleConfirm = () => {
    if (!transactionId) return

    onSubmit({
      investor_id: transaction?.investor_id ?? '',
      transaction_type_code: 'REVERSAL',
      amount: transaction?.amount ?? '',
      transaction_date: transaction?.transaction_date ?? '',
      remarks,
      reference_transaction_id: transactionId,
    })
    setRemarks('')
    setConfirmationText('')
  }

  const txnId = transaction?.txn_id ?? ''
  const canConfirm = !loading && transaction && confirmationText === txnId

  return (
    <Dialog
      isOpen={isOpen}
      headerTitle="Reverse Transaction"
      onClose={handleClose}
    >
      <DialogContent>
        {loading ? (
          <div className="py-4 text-center text-brand-ink-muted">Loading...</div>
        ) : transaction ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-brand-warning-soft bg-brand-warning-soft p-3">
              <span className="text-sm font-medium text-brand-warning-strong">
                ⚠ You are about to reverse transaction{' '}
                <span className="font-bold">{txnId}</span>
              </span>
            </div>
            <div>
              <p className="text-sm text-brand-ink-muted">Investor</p>
              <p className="font-medium text-brand-ink">
                {transaction.investor?.investor_name ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-ink-muted">Transaction Type</p>
              <p className="font-medium text-brand-ink">
                {transaction.transaction_type?.name ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-ink-muted">Amount</p>
              <p className="font-medium text-brand-ink">{transaction.amount}</p>
            </div>
            <div>
              <p className="text-sm text-brand-ink-muted">Transaction Date</p>
              <p className="font-medium text-brand-ink">
                {transaction.transaction_date
                  ? dayjs(transaction.transaction_date).format('DD-MM-YYYY')
                  : '-'}
              </p>
            </div>
            <TextField
              label="Remarks / Reason for Reversal"
              fullWidth
              multiline
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              size="small"
            />
            <div className="border-t border-brand-danger-soft pt-4">
              <p className="mb-2 text-sm font-medium text-brand-danger">
                Type <span className="font-bold">{txnId}</span> to confirm
              </p>
              <TextField
                label={`Type "${txnId}" to confirm`}
                fullWidth
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                size="small"
                error={confirmationText.length > 0 && confirmationText !== txnId}
                helperText={
                  confirmationText.length > 0 && confirmationText !== txnId
                    ? 'Transaction ID does not match'
                    : ''
                }
              />
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-brand-danger">
            Transaction not found
          </div>
        )}

        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outlined" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            Confirm Reverse
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReversalDialog
