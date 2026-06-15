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
          <div className="py-4 text-center text-gray-500">Loading...</div>
        ) : transaction ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-sm text-amber-800 font-medium">
                ⚠ You are about to reverse transaction{' '}
                <span className="font-bold">{txnId}</span>
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Investor</p>
              <p className="font-medium">
                {transaction.investor?.investor_name ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transaction Type</p>
              <p className="font-medium">
                {transaction.transaction_type?.name ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">{transaction.amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transaction Date</p>
              <p className="font-medium">
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
            <div className="border-t border-red-200 pt-4">
              <p className="text-sm text-red-600 font-medium mb-2">
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
          <div className="py-4 text-center text-red-500">
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
