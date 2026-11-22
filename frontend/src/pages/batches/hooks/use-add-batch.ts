import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import type { BatchFormValues, UseAddBatch } from "../types";
import batch from "../api";

import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const useAddBatch: UseAddBatch = (opts) => {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: BatchFormValues) => {
    const res = await batch.create(inputData);
    if (res.status === "success") {
      queryClient.invalidateQueries({ queryKey: ["batch-allowance"] });
      opts.onSuccess();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    } else {
      toast.error(res.error?.message || "Could not create batch");
      queryClient.invalidateQueries({ queryKey: ["batch-allowance"] });
    }
  };

  return {
    onSubmit,
    errors,
    clearError,
  };
};

export default useAddBatch;
