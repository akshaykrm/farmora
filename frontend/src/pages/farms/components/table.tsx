import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import type { Farm } from "../types";

const headers = ["ID", "Name", "Place", "Capacity", "Edit"];

type Props = {
  farms: Farm[];
  onEdit: (selectedId: number) => void;
};

const FarmTable = ({ onEdit, farms }: Props) => {
  const isEmpty = farms.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {farms.map((farm, i) => (
          <TableRow key={farm.id}>
            <TableCell content={i + 1} />
            <TableCell content={farm.name} />
            <TableCell content={farm.place} />
            <TableCell content={farm.capacity} />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                  onClick={() => {
                    onEdit(farm.id);
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
            title="No farms found"
            description="Get started by creating a new farm"
          />
        }
      />
    </>
  );
};

export default FarmTable;
