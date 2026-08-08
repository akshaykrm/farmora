import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import { useMemo } from "react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import dayjs from "dayjs";
import type { Purchase } from "../types";
import { formatCurrency } from "@utils/currency";

const headers = [
  "Invoice Number",
  "Invoice Date",
  "Supplier Name",
  "Type",
  "Quantity",
  "Price",
  "Total Amount",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  data: Purchase[];
};

const ItemTable = ({ onEdit, data }: Props) => {
  const isEmpty = useMemo(() => {
    return data.length === 0;
  }, [data]);

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell content={item.invoice_number} />
              <TableCell
                content={dayjs(item.invoice_date).format("DD-MM-YYYY")}
              />
              <TableCell content={item.vendor?.name} />
              <TableCell
                content={
                  <span className="capitalize">{item.category.type}</span>
                }
              />

              <TableCell content={item.quantity || "-"} />
              <TableCell content={formatCurrency(item.price_per_unit)} />
              <TableCell content={formatCurrency(item.total_price)} />
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
          );
        })}
      </Table>

      <Ternary
        when={isEmpty}
        then={
          <EmptyContentMessage
            title="No purchases found"
            description="Try adjusting your filters or create a new purchase"
          />
        }
      />
    </>
  );
};

export default ItemTable;
