import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import dayjs from "dayjs";
import { roundNumber } from "@utils/number";
import type {
  BatchOverviewItem,
  BatchSortKey,
  SortOrder,
  Totals,
} from "../types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@utils/currency";

const batchHeaders: { label: string; key: BatchSortKey }[] = [
  { label: "Batch Name", key: "name" },
  { label: "Close Date", key: "closed_on" },
  { label: "Avg Weight", key: "avg_weight" },
  { label: "FCR", key: "fcr" },
  { label: "CFCR", key: "cfcr" },
  { label: "Bird Shortage", key: "bird_shortage" },
  { label: "Shortage %", key: "shortage_percentage" },
  { label: "Avg Cost", key: "avg_cost" },
  { label: "Avg Rate", key: "avg_rate" },
  { label: "Profit - Loss Diff", key: "diff" },
  { label: "Profit/Loss", key: "profit" },
];

type BatchOverviewTableProps = {
  data: BatchOverviewItem[];
  totals: Totals;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (key: BatchSortKey, order: SortOrder) => void;
};

const BatchOverviewTable = (props: BatchOverviewTableProps) => {
  const { data, sortBy, sortOrder = "asc", onSort } = props;

  const handleSort = (key: BatchSortKey) => {
    const nextOrder: SortOrder =
      sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    onSort?.(key, nextOrder);
  };

  return (
    <>
      <Table>
        <TableRow>
          {batchHeaders.map(({ label, key }) => {
            const active = sortBy === key;
            const Icon = !active
              ? ArrowUpDown
              : sortOrder === "asc"
                ? ArrowUp
                : ArrowDown;
            return (
              <TableHeaderCell
                key={key}
                content={
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className="inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:text-brand-accent"
                    aria-sort={
                      active
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {label}
                    <Icon
                      className={`h-3.5 w-3.5 ${active ? "" : "opacity-40"}`}
                    />
                  </button>
                }
              />
            );
          })}
        </TableRow>
        {data.map((item) => {
          const {
            avg_weight,
            fcr,
            cfcr,
            bird_shortage,
            shortage_percentage,
            total_expense,
            total_sale_amount,
            total_sale_weight,
          } = item.overviewCalculations;

          const avgCost = total_expense / total_sale_weight;
          const avgRate = total_sale_amount / total_sale_weight;

          return (
            <TableRow key={item.batch.id}>
              <TableCell content={item.batch.name} />
              <TableCell
                content={
                  item.batch.closed_on
                    ? dayjs(item.batch.closed_on).format("DD-MM-YYYY")
                    : "-"
                }
              />
              <TableCell content={roundNumber(avg_weight)} />
              <TableCell content={roundNumber(fcr)} />
              <TableCell content={roundNumber(cfcr)} />
              <TableCell content={bird_shortage} />
              <TableCell content={`${roundNumber(shortage_percentage)}%`} />
              <TableCell content={formatCurrency(avgCost)} />
              <TableCell content={formatCurrency(avgRate)} />
              <TableCell content={formatCurrency(avgRate - avgCost)} />
              <TableCell
                content={formatCurrency(total_sale_amount - total_expense)}
              />
            </TableRow>
          );
        })}
      </Table>
    </>
  );
};

export default BatchOverviewTable;
