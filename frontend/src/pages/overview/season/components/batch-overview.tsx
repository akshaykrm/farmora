import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import dayjs from "dayjs";
import { roundNumber } from "@utils/number";
import type { BatchOverviewItem, Totals } from "../types";
import { formatCurrency } from "@utils/currency";

const batchHeaders = [
  "Batch Name",
  "Close Date",
  "Avg Weight",
  "FCR",
  "CFSR",
  "Avg Cost",
  "Avg Rate",
  "Profit - Loss Diff",
  "Profit/Loss",
];

type BatchOverviewTableProps = {
  data: BatchOverviewItem[];
  totals: Totals;
};

const BatchOverviewTable = (props: BatchOverviewTableProps) => {
  const { data } = props;

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">Batch Overview</h2>
      <Table>
        <TableRow>
          {batchHeaders.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item) => {
          const {
            avg_weight,
            fcr,
            cfcr,
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
              <TableCell content={formatCurrency(avgCost)} />
              <TableCell content={formatCurrency(avgRate)} />
              <TableCell
                content={formatCurrency(total_sale_amount - total_expense)}
              />
              <TableCell content={formatCurrency(avgRate - avgCost)} />
            </TableRow>
          );
        })}
      </Table>
    </>
  );
};

export default BatchOverviewTable;
