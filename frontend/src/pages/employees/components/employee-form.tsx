import { Button, TextField, Autocomplete } from "@mui/material";
import { useForm, type DefaultValues } from "react-hook-form";
import type { EmployeeFormValues } from "../types";
import type { ValidationError } from "@errors/api.error";
import { useEffect, useState } from "react";
import Ternary from "@components/ternary";
import PermissionChecklist from "@components/permission-checklist";
import { permissionsApi, rolesApi, type Permission, type Role } from "@api/roles.api";

type Props = {
  defaultValues: DefaultValues<EmployeeFormValues>;
  onSubmit: (payload: EmployeeFormValues) => void;
  hidePassword?: boolean;
  apiError: ValidationError[];
  onCancel?: () => void;
};

const EmployeeForm = (props: Props) => {
  const { onSubmit, defaultValues, hidePassword, apiError, onCancel } = props;
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const methods = useForm<EmployeeFormValues>({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role_ids: [],
      permission_ids: [],
      ...defaultValues,
    },
  });

  const {
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const roleIds = watch("role_ids") || [];
  const permissionIds = watch("permission_ids") || [];

  useEffect(() => {
    reset({
      name: "",
      username: "",
      password: "",
      role_ids: [],
      permission_ids: [],
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name as keyof EmployeeFormValues, { message });
      });
    }
  }, [apiError, setError]);

  useEffect(() => {
    const load = async () => {
      const [roleRes, permissionList] = await Promise.all([
        rolesApi.fetchAll({ page: 1, limit: 100 }),
        permissionsApi.fetchAll(),
      ]);
      if (roleRes.status === "success" && roleRes.data) {
        setRoles(roleRes.data.data);
      }
      setPermissions(permissionList);
    };
    load();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <TextField
            label="Name"
            type="text"
            size="small"
            {...register("name")}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            label="Username"
            type="text"
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
                type="password"
                size="small"
                {...register("password")}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
            }
          />
          <Autocomplete
            multiple
            options={roles}
            getOptionLabel={(role) => role.name}
            value={roles.filter((role) => roleIds.includes(role.id))}
            onChange={(_, selected) => {
              setValue(
                "role_ids",
                selected.map((role) => role.id),
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Roles" size="small" />
            )}
          />
          <div>
            <p className="mb-1 text-sm font-medium text-brand-ink">
              Extra permissions
            </p>
            <p className="mb-2 text-xs text-brand-ink-muted">
              Added on top of permissions inherited from the selected roles.
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
    </div>
  );
};

export default EmployeeForm;
