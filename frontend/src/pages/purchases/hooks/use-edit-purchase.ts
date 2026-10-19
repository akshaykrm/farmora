import { useCallback, useState } from "react";
import type {
  DuplicateInvoice,
  PurchaseFormValues,
  UseEditPurchase,
} from "../types";
import purchase from "../api";
import type { ValidationError } from "@errors/api.error";
import { duplicateInvoiceFrom } from "./duplicate-invoice";

const useEditPurchase: UseEditPurchase = (selectedId, opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [duplicateInvoice, setDuplicateInvoice] =
    useState<DuplicateInvoice | null>(null);

  const clearError = () => {
    setErrors([]);
    setDuplicateInvoice(null);
  };

  const onSubmit = useCallback(
    async (inputData: PurchaseFormValues) => {
      if (!selectedId) return;
      setDuplicateInvoice(null);
      const res = await purchase.updateById(selectedId, inputData);
      if (res.status === "success") {
        opts.onSuccess();
      } else if (res.status === "validation_error") {
        setErrors(res.error);
      } else {
        setDuplicateInvoice(duplicateInvoiceFrom(res));
      }
    },
    [selectedId],
  );

  return {
    onSubmit,
    errors,
    clearError,
    duplicateInvoice,
  };
};

export default useEditPurchase;
