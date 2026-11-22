import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import dayjs from "dayjs";
import { EyeIcon } from "lucide-react";
import { useState } from "react";
import ViewDetailsDialog from "@components/view-details-dialog";
import type { PurchaseBookTransaction } from "../types";
import { formatCurrency } from "@utils/currency";

const headers = [
  "Invoice Date",
  "Quantity",
  "Price",
  "Amount",
  "Type",
  "Balance",
  "Action",
];

type Props = {
  data: PurchaseBookTransaction[];
};
const PurchaseBookTable = (props: Props) => {
  const { data } = props;
  const isEmpty = data?.length === 0;
  const [viewing, setViewing] = useState<PurchaseBookTransaction | null>(null);

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data?.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
              <TableCell content={item.quantity || "-"} />
              <TableCell content={formatCurrency(item.price)} />
              <TableCell content={formatCurrency(item.amount)} />
              <TableCell
                className={`${item.type === "return" ? "text-brand-danger-strong" : "text-brand-ink"} capitalize`}
                content={item.type || "-"}
              />
              <TableCell content={formatCurrency(item.balance)} />
              <TableCell
                content={
                  <EyeIcon
                    className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                    onClick={() => setViewing(item)}
                  />
                }
              />
            </TableRow>
          );
        })}
      </Table>
      <ViewDetailsDialog
        title="Purchase Book Entry"
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        rows={[
          {
            label: "Date",
            value: viewing ? dayjs(viewing.date).format("DD-MM-YYYY") : "-",
          },
          {
            label: "Type",
            value: <span className="capitalize">{viewing?.type || "-"}</span>,
          },
          { label: "Invoice Number", value: viewing?.invoice_number || "-" },
          { label: "Vendor", value: viewing?.vendor?.name || "-" },
          {
            label: "Item",
            value: viewing?.category?.name || viewing?.name || "-",
          },
          { label: "Quantity", value: viewing?.quantity || "-" },
          { label: "Price", value: formatCurrency(viewing?.price ?? 0) },
          { label: "Amount", value: formatCurrency(viewing?.amount ?? 0) },
          { label: "Balance", value: formatCurrency(viewing?.balance ?? 0) },
        ]}
      />
      <Ternary
        when={isEmpty}
        then={
          <EmptyContentMessage
            title="No purchase records found"
            description="No purchases found for the selected vendor and date range"
          />
        }
      />
    </>
  );
};

export default PurchaseBookTable;
