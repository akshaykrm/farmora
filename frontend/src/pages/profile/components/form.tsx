import { Button, TextField } from "@mui/material";
import { useEffect } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import type { ValidationError } from "@errors/api.error";
import type { ProfileFormValues } from "../types";

type Props = {
  onSubmit: (inputData: ProfileFormValues) => void;
  defaultValues: DefaultValues<ProfileFormValues>;
  apiError: ValidationError[];
  isSaving?: boolean;
};

const ProfileForm = ({
  onSubmit,
  defaultValues,
  apiError,
  isSaving,
}: Props) => {
  const methods = useForm<ProfileFormValues>({ defaultValues });

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    reset,
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name as keyof ProfileFormValues, { message });
      });
    }
  }, [apiError, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4">
        <TextField
          label="Full Name"
          fullWidth
          size="small"
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          {...register("name", {
            required: "Full name is required",
            minLength: {
              value: 3,
              message: "Full name must be at least 3 characters",
            },
          })}
        />

        <TextField
          label="Username"
          fullWidth
          size="small"
          disabled
          {...register("username")}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          size="small"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
        />

        <TextField
          label="Phone Number"
          type="tel"
          fullWidth
          size="small"
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            minLength: {
              value: 7,
              message: "Enter a valid phone number",
            },
          })}
        />
      </div>

      <div className="flex justify-end mt-6 gap-2">
        <Button variant="contained" type="submit" disabled={isSaving}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
