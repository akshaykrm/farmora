import { useState } from "react";
import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import AddNewEmployee from "./components/add-new-employee";
import EditEmployee from "./components/edit-employee";
import ChangeUserPassword from "./components/change-user-password";
import EmployeesTable from "./components/table";
import { Box } from "@mui/material";
import useGetEmployees from "./hooks/use-get-employees";
import useEmployeeFilter from "./hooks/use-employee-filter";
import PaginationWithLimit from "@components/pagination-with-limit";
import type { Employee } from "./types";

const EmployeesPage = () => {
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
          <AddButton label="User" onClick={() => setOpenAdd(true)} />
        }
      />
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
