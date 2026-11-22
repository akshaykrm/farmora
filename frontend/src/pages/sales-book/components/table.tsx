import type { SalesBookTransaction } from "@app-types/sales-book.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import dayjs from "dayjs";
import { EyeIcon } from "lucide-react";
import { useState } from "react";
import ViewDetailsDialog from "@components/view-details-dialog";
import { formatCurrency } from "@utils/currency";
import Totals from "./totals";
import type { SalesBookTotals } from "../types";

const headers = [
  "Date",
  "Birds",
  "Weight (kg)",
  "Price",
  "Amount",
  "Type",
  "Balance",
  "Action",
];

type Props = {
  data: SalesBookTransaction[];
  totals?: SalesBookTotals;
};

const SalesBookTable = (props: Props) => {
  const { data, totals } = props;
  const isEmpty = data.length === 0;
  const [viewing, setViewing] = useState<SalesBookTransaction | null>(null);

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>

        {data.map((item, index) => {
          return (
            <TableRow key={index}>
              <TableCell
                content={dayjs(item.created_date).format("DD-MM-YYYY")}
              />
              <TableCell content={item.bird_no ?? "-"} />
              <TableCell
                content={item.weight ? formatCurrency(item.weight) : "-"}
              />
              <TableCell content={formatCurrency(item.price)} />
              <TableCell content={formatCurrency(item.amount)} />
              <TableCell
                content={
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.type === "cash"
                        ? "bg-brand-success-soft text-brand-success-strong"
                        : "bg-brand-warning-soft text-brand-warning-strong"
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>
                }
              />
              <TableCell
                content={
                  <span className="font-semibold">
                    {formatCurrency(item.balance)}
                  </span>
                }
              />
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
        <Totals totals={totals} />
      </Table>
      <ViewDetailsDialog
        title="Sales Book Entry"
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        rows={[
          {
            label: "Date",
            value: viewing
              ? dayjs(viewing.created_date).format("DD-MM-YYYY")
              : "-",
          },
          { label: "Type", value: viewing?.type.toUpperCase() ?? "-" },
          { label: "Birds", value: viewing?.bird_no ?? "-" },
          {
            label: "Weight (kg)",
            value: viewing?.weight ? formatCurrency(viewing.weight) : "-",
          },
          { label: "Price", value: formatCurrency(viewing?.price ?? 0) },
          { label: "Amount", value: formatCurrency(viewing?.amount ?? 0) },
          { label: "Balance", value: formatCurrency(viewing?.balance ?? 0) },
        ]}
      />
      {isEmpty ? (
        <EmptyContentMessage
          title="Sales Entry not Found"
          description="Current filter do not have any entry, change filter"
        />
      ) : null}
    </>
  );
};

export default SalesBookTable;
