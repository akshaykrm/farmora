import { Dialog, DialogContent } from '@components/dialog'
import InvestorManagementForm from './InvestorManagementForm'
import useGetInvestorById from '../hooks/useGetInvestorById'
import useEditInvestor from '../hooks/useEditInvestor'

type Props = {
  selectedId: number | null
  refetch: () => void
  onClose: () => void
}

const EditInvestor = (props: Props) => {
  const { selectedId, onClose, refetch } = props
  const isShow = selectedId !== null

  const { dataLoaded, selectedData } = useGetInvestorById(selectedId)

  const { onSubmit, errors, clearError } = useEditInvestor(selectedId, {
    onSuccess: () => {
      onClose()
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
      headerTitle="Edit Investor"
      onClose={handleClose}
    >
      <DialogContent>
        {dataLoaded ? (
          <InvestorManagementForm
            onSubmit={onSubmit}
            defaultValues={selectedData}
            apiError={errors}
            onCancel={handleClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default EditInvestor
