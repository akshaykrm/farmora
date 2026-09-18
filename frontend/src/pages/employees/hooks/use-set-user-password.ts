import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import type { SetUserPasswordValues } from "../types";
import employee from "../api";

type Opts = {
  onSuccess: () => void;
};

const useSetUserPassword = (userId: number | null, opts: Opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => {
    setErrors([]);
    setErrorMessage(null);
  };

  const onSubmit = async (inputData: SetUserPasswordValues) => {
    if (!userId) return;
    clearError();
    const res = await employee.setPassword(userId, inputData.new_password);
    if (res.status === "success") {
      opts.onSuccess();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    } else if (res.status === "failed") {
      setErrorMessage(typeof res.data === "string" ? res.data : null);
    }
  };

  return {
    onSubmit,
    errors,
    errorMessage,
    clearError,
  };
};

export default useSetUserPassword;
