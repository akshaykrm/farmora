import { useState } from "react";
import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import ExportMenu from "@components/ExportMenu";
import AddNewEmployee from "./components/add-new-employee";
import EditEmployee from "./components/edit-employee";
import ChangeUserPassword from "./components/change-user-password";
import EmployeesTable from "./components/table";
import { Alert, Button, Box } from "@mui/material";
import useGetEmployees from "./hooks/use-get-employees";
import useEmployeeFilter from "./hooks/use-employee-filter";
import PaginationWithLimit from "@components/pagination-with-limit";
import type { Employee } from "./types";

import { useQuery } from "@tanstack/react-query";
import usePermissions from "@hooks/use-permissions";
import employeeApi from "./api";

const EmployeesPage = () => {
  const { can, user } = usePermissions();
  const allowance = useQuery({
    queryKey: ["user-allowance", user?.master_id],
    queryFn: employeeApi.getAllowance,
  });
  const [isDialogOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [passwordUser, setPasswordUser] = useState<Employee | null>(null);
  const { filter, updateQueryParams } = useEmployeeFilter();

  const { employees, refetch } = useGetEmployees(filter);

  return (
    <div>
      <PageHeader
        title="Users"
        action={
          <div className="flex gap-2">
            <ExportMenu
              permission="user:export"
              endpoint="users/export"
              filter={filter}
              filename="users"
            />
            {can("user:write") && (
              <AddButton
                label="User"
                onClick={() => setOpenAdd(true)}
                disabled={!allowance.data?.can_create || allowance.isFetching}
              />
            )}
          </div>
        }
      />
      {allowance.data && (
        <Alert
          className="mb-4"
          severity={allowance.data.can_create ? "info" : "warning"}
        >
          {allowance.data.package_name || "Current package"}:{" "}
          {allowance.data.used} / {allowance.data.limit ?? "unlimited"} staff
          users. Disabled users count; the subscriber is excluded.
          {!allowance.data.subscription_active
            ? " An active subscription is required to add users."
            : !allowance.data.can_create
              ? " User limit reached. Upgrade your package to add another user."
              : ""}
        </Alert>
      )}
      {allowance.error && (
        <Alert
          severity="error"
          action={<Button onClick={() => allowance.refetch()}>Retry</Button>}
        >
          Unable to load user allowance. {allowance.error.message}
        </Alert>
      )}
      <div>
        <EmployeesTable
          onEdit={setSelectedId}
          onChangePassword={setPasswordUser}
          employees={employees.records}
        />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={employees.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddNewEmployee
        isShow={isDialogOpen}
        onClose={() => setOpenAdd(false)}
        refetch={() => {
          refetch({ page: 1 });
          updateQueryParams({ page: 1 });
        }}
      />
      <EditEmployee
        refetch={() => refetch()}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
      <ChangeUserPassword
        employee={passwordUser}
        onClose={() => setPasswordUser(null)}
      />
    </div>
  );
};

export default EmployeesPage;
