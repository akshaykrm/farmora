import { Dialog, DialogContent } from "@components/dialog";
import GeneralExpenseForm from "./form";
import { useCallback, useEffect, useState } from "react";
import type { ValidationError } from "@errors/api.error";
import generalExpense from "../api";
import type { GeneralExpanceFormValues } from "../types";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: () => void;
};

const defaultValues: GeneralExpanceFormValues = {
  season_id: "",
  purpose: "",
  amount: "",
  date: "",
  narration: "",
};

const EditGeneralExpense = ({ selectedId, onClose, refetch }: Props) => {
  const isShow = selectedId !== null;
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const clearErrors = () => {
    setErrors([]);
  };

  const handleClose = () => {
    onClose();
    clearErrors();
  };

  const [selectedData, setSelectedData] =
    useState<GeneralExpanceFormValues>(defaultValues);

  useEffect(() => {
    const handeGetById = async (selectedId: number) => {
      const res = await generalExpense.fetchById(selectedId);
      if (res.status === "success") {
        if (res.data) {
          const { amount, season_id, purpose, narration, date } = res.data;
          setSelectedData({
            season_id,
            amount: amount.toString(),
            purpose,
            date,
            narration: narration || "",
          });
        }
      }
    };

    if (selectedId) {
      handeGetById(selectedId);
    }
  }, [selectedId]);

  const onSubmit = useCallback(
    async (inputData: GeneralExpanceFormValues) => {
      if (!selectedId) {
        return;
      }
      const res = await generalExpense.updateById(selectedId, inputData);
      if (res.status === "success") {
        handleClose();
        refetch();
      } else if (res.status === "validation_error") {
        setErrors(res.error);
      }
    },
    [selectedId],
  );

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Edit General Expense"
      onClose={handleClose}
    >
      <DialogContent>
        <GeneralExpenseForm
          onSubmit={onSubmit}
          defaultValues={selectedData}
          apiErros={errors}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditGeneralExpense;
