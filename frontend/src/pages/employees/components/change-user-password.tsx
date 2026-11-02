import { Button, TextField } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Dialog, DialogContent } from "@components/dialog";
import type { ValidationError } from "@errors/api.error";
import type { Employee, SetUserPasswordValues } from "../types";
import useSetUserPassword from "../hooks/use-set-user-password";

const defaultValues: SetUserPasswordValues = {
  new_password: "",
  confirm_password: "",
};

type Props = {
  employee: Employee | null;
  onClose: () => void;
};

type FormProps = {
  apiError: ValidationError[];
  errorMessage: string | null;
  onSubmit: (inputData: SetUserPasswordValues) => void;
  onCancel: () => void;
};

const SetPasswordForm = ({
  apiError,
  errorMessage,
  onSubmit,
  onCancel,
}: FormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<SetUserPasswordValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [reset]);

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name as keyof SetUserPasswordValues, { message });
      });
    }
  }, [apiError, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-brand-danger-soft bg-brand-danger-soft p-3">
          <p className="text-sm text-brand-danger-strong">{errorMessage}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        <TextField
          label="New Password"
          type="password"
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
          label="Confirm Password"
          type="password"
          size="small"
          autoComplete="new-password"
          error={Boolean(errors.confirm_password)}
          helperText={errors.confirm_password?.message}
          {...register("confirm_password", {
            required: "Please confirm the new password",
            validate: (value) =>
              value === watch("new_password") || "Passwords do not match",
          })}
        />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          variant="outlined"
          type="button"
          onClick={() => {
            reset(defaultValues);
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          Update Password
        </Button>
      </div>
    </form>
  );
};

const ChangeUserPassword = ({ employee, onClose }: Props) => {
  const isShow = employee !== null;
  const { onSubmit, errors, errorMessage, clearError } = useSetUserPassword(
    employee?.id ?? null,
    {
      onSuccess: () => {
        toast.success("Password updated successfully");
        clearError();
        onClose();
      },
    },
  );

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <Dialog
      headerTitle={
        employee ? `Change password for ${employee.name}` : "Change password"
      }
      isOpen={isShow}
      onClose={handleClose}
    >
      <DialogContent>
        {isShow && (
          <SetPasswordForm
            apiError={errors}
            errorMessage={errorMessage}
            onSubmit={onSubmit}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUserPassword;
