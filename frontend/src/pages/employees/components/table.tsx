import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import type { Employee } from "../types";

const headers = ["ID", "Name", "Username", "User Type", "Reset Flag", "Edit"];

type Props = {
  onEdit: (selectedId: number) => void;
  employees: Employee[];
};

const EmployeesTable = ({ onEdit, employees }: Props) => {
  const isEmpty = employees.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {employees.map((employee, i) => (
          <TableRow key={employee.id}>
            <TableCell content={i + 1} />
            <TableCell content={employee.name} />
            <TableCell content={employee.username} />
            <TableCell content={employee.user_type} />
            <TableCell content={employee.reset_flag ? "Yes" : "No"} />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                  onClick={() => {
                    onEdit(employee.id);
                  }}
                />
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No employees found"
            description="Get started by creating a new employee"
          />
        }
      />
    </>
  );
};

export default EmployeesTable;
