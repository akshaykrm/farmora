import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import type { BatchFormValues, UseAddBatch } from "../types";
import batch from "../api";

const useAddBatch: UseAddBatch = (opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: BatchFormValues) => {
    const res = await batch.create(inputData);
    if (res.status === "success") {
      opts.onSuccess();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    }
  };

  return {
    onSubmit,
    errors,
    clearError,
  };
};

export default useAddBatch;
