import { Dialog, DialogContent } from "@components/dialog";
import GeneralExpenseForm from "./form";
import type { ValidationError } from "@errors/api.error";
import { useState } from "react";
import generalExpense from "../api";
import type { GeneralExpanceFormValues } from "../types";

const defaultValues: GeneralExpanceFormValues = {
  season_id: "",
  purpose: "",
  amount: "",
  date: "",
  narration: "",
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: () => void;
};

const AddGeneralExpense = ({ isShow, onClose, refetch }: Props) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearErrors = () => {
    setErrors([]);
  };

  const handleClose = () => {
    onClose();
    clearErrors();
  };

  const onSubmit = async (inputData: GeneralExpanceFormValues) => {
    const res = await generalExpense.create(inputData);
    if (res.status === "success") {
      if (res.data) {
        handleClose();
        refetch();
      }
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    }
  };

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Add General Expense"
      onClose={handleClose}
    >
      <DialogContent>
        <GeneralExpenseForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          apiErros={errors}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddGeneralExpense;
