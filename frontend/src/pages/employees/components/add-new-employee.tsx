import { Dialog, DialogContent } from "@components/dialog";
import EmployeeForm from "./employee-form";
import type { DefaultValues } from "react-hook-form";
import type { EmployeeFormValues } from "../types";
import useAddEmployee from "../hooks/use-add-employee";

const defaultValues: DefaultValues<EmployeeFormValues> = {
  name: "",
  username: "",
  password: "",
  role_ids: [],
  permission_ids: [],
};

type AddNewEmployeeType = {
  isShow: boolean;
  refetch: () => void;
  onClose: () => void;
};

const AddNewEmployee = (props: AddNewEmployeeType) => {
  const { isShow, onClose, refetch } = props;

  const { onSubmit, clearError, errors } = useAddEmployee({
    onSuccess: () => {
      onClose();
      refetch();
    },
  });

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <>
      <Dialog
        headerTitle="Add User"
        isOpen={isShow}
        onClose={handleClose}
        className="max-w-2xl"
      >
        <DialogContent>
          <EmployeeForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            apiError={errors}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewEmployee;
