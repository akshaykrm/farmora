import { Dialog, DialogContent } from '@components/dialog'
import InvestorManagementForm from './InvestorManagementForm'
import useAddInvestor from '../hooks/useAddInvestor'
import type { InvestorFormValues } from '../types'

const defaultValues: InvestorFormValues = {
  investor_name: '',
  investor_phone: '',
  investor_email: '',
  is_active: true,
}

type Props = {
  isShow: boolean
  refetch: () => void
  onClose: () => void
}

const AddInvestor = (props: Props) => {
  const { isShow, onClose, refetch } = props

  const { onSubmit, errors, clearError } = useAddInvestor({
    onSuccess: () => {
      handleClose()
      refetch()
    },
  })

  const handleClose = () => {
    onClose()
    clearError()
  }

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Add New Investor"
      onClose={handleClose}
    >
      <DialogContent>
        <InvestorManagementForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          apiError={errors}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  )
}

export default AddInvestor
