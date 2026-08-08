import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import type { ChangePasswordFormValues, UseChangePassword } from "../types";
import profile from "../api";

const useChangePassword: UseChangePassword = (opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => {
    setErrors([]);
    setErrorMessage(null);
  };

  const onSubmit = async (inputData: ChangePasswordFormValues) => {
    clearError();
    const res = await profile.changePassword({
      current_password: inputData.current_password,
      new_password: inputData.new_password,
    });
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

export default useChangePassword;
