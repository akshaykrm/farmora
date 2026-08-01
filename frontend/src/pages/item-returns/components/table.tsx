import type { ItemReturn } from "../types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import dayjs from "dayjs";

const headers = [
  "Return Type",
  "Date",
  "Quantity",
  "Rate",
  "Total Amount",
  "Category",
  "From Batch",
  "To Batch/Vendor",
  "Payment Type",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  data: ItemReturn[];
};

const ItemReturnTable = ({ onEdit, data }: Props) => {
  const isEmpty = data?.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((returnItem) => (
          <TableRow key={returnItem.id}>
            <TableCell
              content={returnItem.return_type}
              className="capitalize"
            />
            <TableCell
              content={dayjs(returnItem.date).format("DD-MM-YYYY")}
            />

            <TableCell content={returnItem.quantity} />
            <TableCell content={returnItem.rate_per_bag} />
            <TableCell content={returnItem.total_amount} />

            <TableCell content={returnItem.category?.type || "-"} />
            <TableCell content={returnItem.from_batch_data?.name || "-"} />
            <TableCell
              content={
                returnItem.return_type === "batch"
                  ? returnItem.to_batch_data?.name || "-"
                  : returnItem.to_vendor_data?.name || "-"
              }
            />

            <TableCell
              content={
                <Ternary
                  when={returnItem.return_type === "vendor"}
                  then={
                    <span className="capitalize">
                      {returnItem.payment_type}
                    </span>
                  }
                  otherwise={"-"}
                />
              }
            />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                  onClick={() => {
                    onEdit(returnItem.id);
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
            title="No returns found"
            description="Try adjusting your filters or create a new return"
          />
        }
      />
    </>
  );
};

export default ItemReturnTable;
