import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import generalSalesApi from "../api";
import type { GeneralSalesFormValues } from "../types";

function useAddGeneralSales(onSuccess: () => void) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: GeneralSalesFormValues) => {
    const res = await generalSalesApi.create(inputData);
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
