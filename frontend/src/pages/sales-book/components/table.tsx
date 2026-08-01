import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import dayjs from "dayjs";
import { formatCurrency } from "@utils/currency";
import Totals from "./totals";
import type { SalesBookTotals, SalesBookTransaction } from "../types";

const headers = [
  "Date",
  "Birds",
  "Weight (kg)",
  "Price",
  "Amount",
  "Type",
  "Balance",
];

type Props = {
  data: SalesBookTransaction[];
  totals?: SalesBookTotals;
};

const SalesBookTable = (props: Props) => {
  const { data, totals } = props;
  const isEmpty = data.length === 0;

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
            </TableRow>
          );
        })}
        <Totals totals={totals} />
      </Table>
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
