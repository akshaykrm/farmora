import type { EmployeeFormValues, UseAddEmployee } from "../types";
import employee from "../api";
import { useState } from "react";
import type { ValidationError } from "@errors/api.error";

const useAddEmployee: UseAddEmployee = (opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: EmployeeFormValues) => {
    const res = await employee.create(inputData);
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

export default useAddEmployee;
