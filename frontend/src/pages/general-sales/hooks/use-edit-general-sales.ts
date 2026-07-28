import generalSales from "@api/general-sales.api";
import type { GeneralSalesFormValues } from "@app-types/general-sales.types";
import { useCallback, useState } from "react";
import type { ValidationError } from "@errors/api.error";

function useEditGeneralSale(selectedId: number | null, onSuccess: () => void) {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = useCallback(
    async (inputData: GeneralSalesFormValues) => {
      if (!selectedId) return;
      const res = await generalSales.updateById(selectedId, inputData);
      if (res.status === "success") {
        onSuccess();
        clearError();
      } else if (res.status === "validation_error") {
        setErrors(res.error);
      }
    },
    [selectedId],
  );

  return { errors, clearError, onSubmit };
}

export default useEditGeneralSale;
