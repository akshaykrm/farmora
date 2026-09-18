import { Dialog, DialogContent } from "@components/dialog";
import EmployeeForm from "./employee-form";
import Ternary from "@components/ternary";
import useGetEmployeeById from "../hooks/use-get-employee-by-id";
import useEditEmployee from "../hooks/use-edit-employee";

type Props = {
  selectedId: number | null;
  refetch: () => void;
  onClose: () => void;
};

const EditEmployee = (props: Props) => {
  const { selectedId, onClose, refetch } = props;
  const { dataLoaded, selectedData } = useGetEmployeeById(selectedId);
  const isShow = selectedId !== null;

  const { onSubmit, clearError, errors } = useEditEmployee(selectedId, {
    onSuccess: () => {
      refetch();
      onClose();
    },
  });

  const handleClose = () => {
    onClose();
    clearError();
  };

  return (
    <>
      <Dialog
        headerTitle="Edit User"
        isOpen={isShow}
        onClose={handleClose}
        className="max-w-2xl"
      >
        <DialogContent>
          <Ternary
            when={dataLoaded}
            then={
              <EmployeeForm
                onSubmit={onSubmit}
                defaultValues={selectedData}
                hidePassword
                apiError={errors}
                onCancel={handleClose}
              />
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditEmployee;
