import Ternary from "@components/ternary";
import { TextField, Button } from "@mui/material";
import { useForm, type DefaultValues } from "react-hook-form";
import type { EmployeeFormValues } from "../types";
import type { ValidationError } from "@errors/api.error";
import { useEffect } from "react";

type Props = {
  defaultValues: DefaultValues<EmployeeFormValues>;
  onSubmit: (payload: any) => void;
  hidePassword?: boolean;
  apiError: ValidationError[];
  onCancel?: () => void;
};

const EmployeeForm = (props: Props) => {
  const { onSubmit, defaultValues, hidePassword, apiError, onCancel } = props;

  const methods = useForm<EmployeeFormValues>({
    defaultValues,
  });

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name, { message });
      });
    }
  }, [apiError]);

  return (
    <div>
      <form {...methods} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <TextField
            label="Name"
            type="text"
            placeholder="name"
            size="small"
            {...register("name")}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            label="Username"
            type="text"
            placeholder="username"
            size="small"
            {...register("username")}
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
          />
          <Ternary
            when={!hidePassword}
            then={
              <TextField
                label="Password"
                placeholder="password"
                size="small"
                {...register("password")}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
            }
          />
        </div>
        <div className="flex justify-end mt-6 gap-2">
          {onCancel && (
            <Button variant="outlined" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
