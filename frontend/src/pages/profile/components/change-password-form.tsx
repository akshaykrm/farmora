import { Button, TextField } from "@mui/material";
import { useEffect } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import type { ValidationError } from "@errors/api.error";
import type { ChangePasswordFormValues } from "../types";

type Props = {
  onSubmit: (inputData: ChangePasswordFormValues) => void;
  defaultValues: DefaultValues<ChangePasswordFormValues>;
  apiError: ValidationError[];
  errorMessage: string | null;
  onCancel?: () => void;
};

const defaultPasswordValues: DefaultValues<ChangePasswordFormValues> = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const ChangePasswordForm = ({
  onSubmit,
  defaultValues,
  apiError,
  errorMessage,
  onCancel,
}: Props) => {
  const methods = useForm<ChangePasswordFormValues>({ defaultValues });

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    reset,
    watch,
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name as keyof ChangePasswordFormValues, { message });
      });
    }
  }, [apiError, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-brand-danger-soft border border-brand-danger-soft">
          <p className="text-sm text-brand-danger-strong">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          size="small"
          autoComplete="current-password"
          error={Boolean(errors.current_password)}
          helperText={errors.current_password?.message}
          {...register("current_password", {
            required: "Current password is required",
          })}
        />

        <TextField
          label="New Password"
          type="password"
          fullWidth
          size="small"
          autoComplete="new-password"
          error={Boolean(errors.new_password)}
          helperText={errors.new_password?.message}
          {...register("new_password", {
            required: "New password is required",
            minLength: {
              value: 3,
              message: "Password must be at least 3 characters",
            },
          })}
        />

        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          size="small"
          autoComplete="new-password"
          error={Boolean(errors.confirm_password)}
          helperText={errors.confirm_password?.message}
          {...register("confirm_password", {
            required: "Please confirm your new password",
            validate: (value) =>
              value === watch("new_password") || "Passwords do not match",
          })}
        />
      </div>

      <div className="flex justify-end mt-6 gap-2">
        {onCancel && (
          <Button
            variant="outlined"
            type="button"
            onClick={() => {
              reset(defaultPasswordValues);
              onCancel();
            }}
          >
            Cancel
          </Button>
        )}
        <Button variant="contained" type="submit">
          Update Password
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
