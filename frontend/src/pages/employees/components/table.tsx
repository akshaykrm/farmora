import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon, KeyRound } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import usePermissions from "@hooks/use-permissions";
import { USER_TYPE_LABELS } from "@utils/user-types";
import type { Employee } from "../types";

const headers = ["ID", "Name", "Username", "Type", "Actions"];

type Props = {
  onEdit: (selectedId: number) => void;
  onChangePassword: (employee: Employee) => void;
  employees: Employee[];
};

const EmployeesTable = ({ onEdit, onChangePassword, employees }: Props) => {
  const { can } = usePermissions();
  const isEmpty = employees.length === 0;
  const canEdit = can("user:edit");

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
            <TableCell
              content={
                USER_TYPE_LABELS[employee.user_type] || employee.user_type
              }
            />
            <TableCell
              content={
                <div className="flex items-center gap-3">
                  <EditIcon
                    className="h-5 w-5 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                    onClick={() => onEdit(employee.id)}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      title="Change password"
                      onClick={() => onChangePassword(employee)}
                      className="rounded-md p-0.5 text-brand-ink-muted hover:text-brand-ink-soft"
                    >
                      <KeyRound className="h-5 w-5" />
                    </button>
                  )}
                </div>
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <EmptyContentMessage
            title="No users found"
            description="Get started by creating a new user"
          />
        }
      />
    </>
  );
};

export default EmployeesTable;
