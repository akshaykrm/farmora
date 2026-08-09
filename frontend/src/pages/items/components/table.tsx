import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
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
        {data.map((item, i) => (
          <TableRow key={item.id}>
            <TableCell content={i + 1} />
            <TableCell content={item.brand?.name || item.name || "-"} />
            <TableCell content={item.base_price} />
            <TableCell
              content={<span className="capitalize">{item.type}</span>}
            />
            <TableCell content={item.vendor.name} />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                  onClick={() => {
                    onEdit(item.id);
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
          <EmptyContentMessage
            title="No items found"
            description="Get started by creating a new item"
          />
        }
      />
    </>
  );
};

export default ItemTable;
