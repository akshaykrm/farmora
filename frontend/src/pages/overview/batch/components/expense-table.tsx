import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { roundNumber } from "@utils/number";
import dayjs from "dayjs";
import type {
  BatchOverviewExpense,
  BatchOverviewSlot,
  BatchOverviewSummary,
} from "../types";
import { formatCurrency } from "@utils/currency";

const expenseHeaders = ["Date", "Purpose", "Quantity", "Price", "Amount"];

type Props = {
  expenses: BatchOverviewSlot<BatchOverviewExpense>;
  summary: BatchOverviewSummary;
};

const ExpenseTable = (props: Props) => {
  const { expenses, summary } = props;

  const { data } = expenses;
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
                    className={`capitalize ${item.return_type === "batch" ? "text-red-600" : ""}`}
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
        <div className="bg-gray-50 p-6 text-center text-gray-500">
          No expenses found
        </div>
      )}
    </>
  );
};

export default ExpenseTable;
