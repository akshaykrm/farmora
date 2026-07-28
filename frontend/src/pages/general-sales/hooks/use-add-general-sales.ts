import generalSales from "@api/general-sales.api";
import type { GeneralSalesFormValues } from "@app-types/general-sales.types";
import { useState } from "react";
import type { ValidationError } from "@errors/api.error";

function useAddGeneralSales(onSuccess: () => void) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: GeneralSalesFormValues) => {
    const res = await generalSales.create(inputData);
    if (res.status === "success") {
      onSuccess();
      clearError();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    }
  };

  return { errors, clearError, onSubmit };
}

export default useAddGeneralSales;
