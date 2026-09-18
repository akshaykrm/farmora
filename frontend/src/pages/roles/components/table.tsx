import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import type { Role } from "@api/roles.api";

const headers = ["ID", "Name", "Description", "Edit"];

type Props = {
  roles: Role[];
  onEdit: (selectedId: number) => void;
};

const RoleTable = ({ onEdit, roles }: Props) => {
  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {roles.map((role, i) => (
          <TableRow key={role.id}>
            <TableCell content={i + 1} />
            <TableCell content={role.name} />
            <TableCell content={role.description || "-"} />
            <TableCell
              content={
                <EditIcon
                  className="h-6 w-6 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                  onClick={() => onEdit(role.id)}
                />
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={roles.length === 0}
        then={
          <EmptyContentMessage
            title="No roles found"
            description="Create a role to assign permissions to users"
          />
        }
      />
    </>
  );
};

export default RoleTable;
