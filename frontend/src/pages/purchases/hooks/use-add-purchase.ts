import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import type {
  DuplicateInvoice,
  PurchaseFormValues,
  UseAddPurchase,
} from "../types";
import purchases from "../api";
import { duplicateInvoiceFrom } from "./duplicate-invoice";

const useAddPurchase: UseAddPurchase = (opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [duplicateInvoice, setDuplicateInvoice] =
    useState<DuplicateInvoice | null>(null);

  const clearError = () => {
    setErrors([]);
    setDuplicateInvoice(null);
  };

  const onSubmit = async (inputData: PurchaseFormValues) => {
    setDuplicateInvoice(null);
    const res = await purchases.create(inputData);
    if (res.status === "success") {
      opts.onSuccess();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    } else {
      setDuplicateInvoice(duplicateInvoiceFrom(res));
    }
  };

  return {
    onSubmit,
    errors,
    clearError,
    duplicateInvoice,
  };
};

export default useAddPurchase;
