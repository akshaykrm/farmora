import { useState } from "react";
import PageTitle from "@components/PageTitle";
import AddNewEmployee from "./components/add-new-employee";
import EditEmployee from "./components/edit-employee";
import EmployeesTable from "./components/table";
import { Box, Button } from "@mui/material";
import useGetEmployees from "./hooks/use-get-employees";
import useEmployeeFilter from "./hooks/use-employee-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

const EmployeesPage = () => {
  const [isDialogOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useEmployeeFilter();

  const { employees, refetch } = useGetEmployees(filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Employees" />
        <Button variant="contained" onClick={() => setOpenAdd(true)}>
          Add Employee
        </Button>
      </div>
      <div>
        <EmployeesTable onEdit={setSelectedId} employees={employees.records} />
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
    </div>
  );
};

export default EmployeesPage;
