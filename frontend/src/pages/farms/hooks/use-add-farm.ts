import type { FarmFormValues } from "../types";
import type { ValidationError } from "@errors/api.error";
import { useState } from "react";
import farms from "../api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useAddFarm = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearErrors = () => setErrors([]);

  const onSubmit = async (inputData: FarmFormValues) => {
    const res = await farms.create(inputData);
    queryClient.invalidateQueries({ queryKey: ["farm-allowance"] });
    if (res.status === "success") {
      if (res.data) {
        onSuccess();
        clearErrors();
      }
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    } else {
      toast.error(
        typeof res.data === "string"
          ? res.data
          : res.error?.message || "Unable to create farm. Please retry.",
      );
    }
  };

  return { errors, onSubmit, clearErrors };
};

export default useAddFarm;
