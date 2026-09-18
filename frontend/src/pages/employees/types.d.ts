import type { ListResponse } from "@app-types/response.types";
import type { ValidationError } from "@errors/api.error";

export type EmployeeFormValues = {
  name: string;
  username: string;
  password?: string;
  role_ids: number[];
  permission_ids: number[];
};

export type Employee = {
  id: number;
  name: string;
  username: string;
  parent_id: number;
  user_type: string;
  role_ids?: number[];
  permission_ids?: number[];
};

export type EmployeesListResponse = ListResponse<Employee>;

export type UseEmployeeReturn = {
  onSubmit: (inputData: EmployeeFormValues) => void;
  errors: ValidationError[];
  clearError: () => void;
};

export type Opts = {
  onSuccess: () => void;
};

export type UseAddEmployee = (opts: Opts) => UseEmployeeReturn;

export type UseEditEmployee = (
  selectedId: number | null,
  opts: Opts,
) => UseEmployeeReturn;

export type SetUserPasswordValues = {
  new_password: string;
  confirm_password: string;
};
