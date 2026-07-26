import { useState } from "react";
import PageTitle from "@components/PageTitle";
import AddNewEmployee from "./components/add-new-employee";
import EditEmployee from "./components/edit-employee";
import EmployeesTable from "./components/table";
import { Box, Button, Pagination } from "@mui/material";
import useGetEmployees from "./hooks/use-get-employees";
import useEmployeeFilter from "./hooks/use-employee-filter";

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
        <Pagination
          count={employees.totalPages}
          size="small"
          defaultPage={1}
          onChange={(_, page) => {
            updateQueryParams({ page });
          }}
          page={filter.page}
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
