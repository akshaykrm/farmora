import { Button } from "@mui/material";
import { useForm, type DefaultValues } from "react-hook-form";
import { useEffect, useState } from "react";
import { RHFTextField } from "@components/form/input";
import type { ValidationError } from "@errors/api.error";
import type { RoleFormValues } from "../types";
import PermissionChecklist from "@components/permission-checklist";
import { permissionsApi, type Permission } from "@api/roles.api";

type Props = {
  defaultValues: DefaultValues<RoleFormValues>;
  onSubmit: (payload: RoleFormValues) => void;
  apiErrors: ValidationError[];
  onCancel?: () => void;
};

const RoleForm = ({ defaultValues, onSubmit, apiErrors, onCancel }: Props) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const methods = useForm<RoleFormValues>({
    defaultValues: {
      name: "",
      description: "",
      permission_ids: [],
      ...defaultValues,
    },
  });
  const { handleSubmit, control, setError, setValue, watch, reset } = methods;
  const permissionIds = watch("permission_ids") || [];

  useEffect(() => {
    reset({
      name: "",
      description: "",
      permission_ids: [],
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    apiErrors.forEach((error) => {
      setError(error.name as keyof RoleFormValues, { message: error.message });
    });
  }, [apiErrors, setError]);

  useEffect(() => {
    permissionsApi.fetchAll().then(setPermissions);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4">
        <RHFTextField label="Name" name="name" control={control} size="small" />
        <RHFTextField
          label="Description"
          name="description"
          control={control}
          size="small"
        />
        <div>
          <p className="mb-1 text-sm font-medium text-brand-ink">
            Role permissions
          </p>
          <p className="mb-2 text-xs text-brand-ink-muted">
            Users with this role inherit these permissions.
          </p>
          <PermissionChecklist
            permissions={permissions}
            value={permissionIds}
            onChange={(ids) => setValue("permission_ids", ids)}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
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
  );
};

export default RoleForm;
