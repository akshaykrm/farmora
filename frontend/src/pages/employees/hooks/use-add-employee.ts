import type { EmployeeFormValues, UseAddEmployee } from "../types";
import employee from "../api";
import { useState } from "react";
import type { ValidationError } from "@errors/api.error";

import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const useAddEmployee: UseAddEmployee = (opts) => {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: EmployeeFormValues) => {
    const res = await employee.create(inputData);
    if (res.status === "success") {
      queryClient.invalidateQueries({ queryKey: ["user-allowance"] });
      opts.onSuccess();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    } else {
      toast.error(res.error?.message || "Could not add user");
      queryClient.invalidateQueries({ queryKey: ["user-allowance"] });
    }
  };

  return {
    onSubmit,
    errors,
    clearError,
  };
};

export default useAddEmployee;
