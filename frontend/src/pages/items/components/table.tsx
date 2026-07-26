import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import type { Item } from "../types";

const headers = ["ID", "Name", "Base Price", "Type", "Vendor", "Action"];

type Props = {
  onEdit: (selectedId: number) => void;
  data: Item[];
};

const ItemTable = ({ onEdit, data }: Props) => {
  const isEmpty = data.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((itemCategory, i) => (
          <TableRow key={itemCategory.id}>
            <TableCell content={i + 1} />
            <TableCell content={itemCategory.name} />
            <TableCell content={itemCategory.base_price} />
            <TableCell
              content={<span className="capitalize">{itemCategory.type}</span>}
            />
            <TableCell content={itemCategory.vendor.name} />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                  onClick={() => {
                    onEdit(itemCategory.id);
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

export default ItemTable;
