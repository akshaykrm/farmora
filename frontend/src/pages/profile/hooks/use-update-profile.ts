import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import type { ProfileFormValues, UseUpdateProfile } from "../types";
import profile from "../api";

const useUpdateProfile: UseUpdateProfile = (opts) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: ProfileFormValues) => {
    const res = await profile.updateCurrent({
      name: inputData.name,
      email: inputData.email,
      phone: inputData.phone,
    });
    if (res.status === "success") {
      opts.onSuccess(inputData);
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

export default useUpdateProfile;
