import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { roundNumber } from "@utils/number";
import dayjs from "dayjs";
import type { BatchOverviewExpense, BatchOverviewSummary } from "../types";
import { formatCurrency } from "@utils/currency";

const expenseHeaders = ["Date", "Purpose", "Quantity", "Price", "Amount"];

type Props = {
  data: BatchOverviewExpense[];
  summary: BatchOverviewSummary;
};

const ExpenseTable = (props: Props) => {
  const { data, summary } = props;

  const { total_purchase_amount, total_purchase_feeds } = summary;

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">Expenses</h2>
      <Table>
        <TableRow>
          {expenseHeaders.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item, index) => {
          return (
            <TableRow key={index}>
              <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
              <TableCell
                content={
                  <span
                    className={`capitalize ${item.return_type === "batch" ? "text-brand-danger" : ""}`}
                  >
                    {item.category.type}
                  </span>
                }
              />
              <TableCell content={item.quantity} />
              <TableCell content={`₹${item.price_per_unit}`} />
              <TableCell content={`₹${item.net_amount}`} />
            </TableRow>
          );
        })}

        <TableRow>
          <TableCell content={<strong>Total</strong>} />
          <TableCell content="" />
          <TableCell
            content={<strong>{roundNumber(total_purchase_feeds)}</strong>}
          />
          <TableCell content="" />
          <TableCell
            content={<strong>{formatCurrency(total_purchase_amount)}</strong>}
          />
        </TableRow>
      </Table>
      {data.length === 0 && (
        <div className="bg-brand-canvas p-6 text-center text-brand-ink-muted">
          No expenses found
        </div>
      )}
    </>
  );
};

export default ExpenseTable;
