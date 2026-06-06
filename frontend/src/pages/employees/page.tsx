import { useState } from "react";
import PageTitle from "@components/PageTitle";
import AddNewEmployee from "./components/add-new-employee";
import EditEmployee from "./components/edit-employee";
import EmployeesTable from "./components/table";
import { Button } from "@mui/material";
import useGetEmployees from "./hooks/use-get-employees";

const EmployeesPage = () => {
  const [isDialogOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { employeeList, handleFetchAllEmployees } = useGetEmployees();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Employees" />
        <Button variant="contained" onClick={() => setOpenAdd(true)}>
          Add Employee
        </Button>
      </div>
      <div>
        <EmployeesTable onEdit={setSelectedId} data={employeeList} />
      </div>
      <AddNewEmployee
        isShow={isDialogOpen}
        onClose={() => setOpenAdd(false)}
        refetch={handleFetchAllEmployees}
      />
      <EditEmployee
        refetch={handleFetchAllEmployees}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};

export default EmployeesPage;
