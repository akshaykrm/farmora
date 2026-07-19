import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import TableCell from "@components/TableCell";
import DataLoading from "@components/data-loading";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import type { BalanceSheetResponse, Transaction } from "../types";
import dayjs from "dayjs";
import { Card } from "@mui/material";
import { formatCurrency } from "@utils/currency";

type Props = {
  data: BalanceSheetResponse | null;
  isLoading: boolean;
};

const formatDate = (date: string) => {
  return dayjs(date).format("DD-MM-YYYY");
};

const BalanceSheetTable = ({ data, isLoading }: Props) => {
  return (
    <Ternary
      when={isLoading}
      then={<DataLoading />}
      otherwise={
        <Ternary
          when={data !== null}
          then={<AllTables data={data!} />}
          otherwise={
            <DataNotFound
              title="No data found"
              description="Apply filters to view cash flow"
            />
          }
        />
      }
    />
  );
};

const TransactionsTable = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <table className="min-w-full">
        <thead>
          <tr>
            <TableHeaderCell content="Date" />
            <TableHeaderCell content="Purpose" />
            <TableHeaderCell content="Type" />
            <TableHeaderCell content="Amount" className="text-right" />
            <TableHeaderCell content="Balance" className="text-right" />
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((t, index) => (
              <TableRow key={index}>
                <TableCell content={formatDate(t.date)} />
                <TableCell content={t.purpose} />
                <TableCell
                  content={
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        t.type === "in"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {t.type === "in" ? "IN" : "OUT"}
                    </span>
                  }
                />
                <TableCell
                  content={formatCurrency(t.amount)}
                  className="text-right"
                />
                <TableCell
                  content={formatCurrency(t.balance)}
                  className="text-right font-medium"
                />
              </TableRow>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const SummaryCards = ({ data }: { data: BalanceSheetResponse }) => {
  const { opening_balance, summary } = data;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500 mb-1">Opening Balance</p>
        <p className="text-lg font-semibold text-gray-900">
          {formatCurrency(opening_balance)}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-green-600 mb-1">Total In</p>
        <p className="text-lg font-semibold text-green-600">
          {formatCurrency(summary.total_in)}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-red-600 mb-1">Total Out</p>
        <p className="text-lg font-semibold text-red-600">
          {formatCurrency(summary.total_out)}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500 mb-1">Closing Balance</p>
        <p className="text-lg font-bold text-gray-900">
          {formatCurrency(summary.closing_balance)}
        </p>
      </div>
    </div>
  );
};

const DetailsCard = ({ data }: { data: BalanceSheetResponse }) => {
  const { summary } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <table className="min-w-full">
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="px-4 py-3 text-sm text-gray-600">
              Liability (Unpaid)
            </td>
            <td className="px-4 py-3 text-sm text-right font-medium text-orange-600">
              {formatCurrency(summary.liability)}
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="px-4 py-3 text-sm text-gray-600">
              Receivable (Unpaid)
            </td>
            <td className="px-4 py-3 text-sm text-right font-medium text-yellow-600">
              {formatCurrency(summary.receivable)}
            </td>
          </tr>
          <tr className="bg-gray-50">
            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
              Net
            </td>
            <td
              className={`px-4 py-3 text-sm text-right font-bold ${summary.net >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(summary.net)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const BreakdownTable = ({ data }: { data: BalanceSheetResponse }) => {
  const { breakdown } = data;

  const rows = [
    {
      label: "Purchases",
      in: breakdown.purchases.in,
      out: breakdown.purchases.out,
      liability: breakdown.purchases.liability,
    },
    {
      label: "Sales",
      in: breakdown.sales.in,
      out: 0,
      receivable: breakdown.sales.receivable,
    },
    {
      label: "Purchase Returns",
      in: breakdown.purchase_returns.in,
      out: 0,
      liabilityReduction: breakdown.purchase_returns.liability_reduction,
    },
    {
      label: "Working Costs",
      in: breakdown.working_costs.in,
      out: breakdown.working_costs.out,
    },
    { label: "General Expenses", in: 0, out: breakdown.general_expenses.out },
    { label: "Expense Sales", in: breakdown.expense_sales.in, out: 0 },
    {
      label: "Integration Books",
      in: 0,
      out: breakdown.integration_books.out,
      liability: breakdown.integration_books.liability,
    },
    {
      label: "Investor Capital",
      in: breakdown.investor_capital?.in ?? 0,
      out: breakdown.investor_capital?.out ?? 0,
    },
    {
      label: "Investor Profit",
      in: breakdown.investor_profit?.in ?? 0,
      out: breakdown.investor_profit?.out ?? 0,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <table className="min-w-full">
        <thead>
          <tr>
            <TableHeaderCell content="Category" />
            <TableHeaderCell content="In" className="text-right" />
            <TableHeaderCell content="Out" className="text-right" />
            <TableHeaderCell content="Pending" className="text-right" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const pending =
              row.liability || row.receivable || row.liabilityReduction || 0;
            const pendingLabel = row.liabilityReduction
              ? "Liability Reduction"
              : row.liability
                ? "Liability"
                : row.receivable
                  ? "Receivable"
                  : "";
            return (
              <tr key={index} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {row.label}
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600">
                  {row.in > 0 ? formatCurrency(row.in) : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-600">
                  {row.out > 0 ? formatCurrency(row.out) : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-right text-orange-600">
                  {pending > 0
                    ? `${pendingLabel}: ${formatCurrency(pending)}`
                    : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const AllTables = ({ data }: { data: BalanceSheetResponse }) => {
  const { transactions, summary } = data;

  const { total_in, total_out } = summary;

  const balance = total_in - total_out;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
        <Card className="p-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold capitalize text-muted-foreground">
              Total In
            </h3>

            <p className="text-3xl font-bold tracking-tight text-green-600">
              {formatCurrency(summary.total_in)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold capitalize text-muted-foreground">
              Total Out
            </h3>

            <p className="text-3xl font-bold tracking-tight text-red-600">
              {formatCurrency(summary.total_out)}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold capitalize text-muted-foreground">
              Balance
            </h3>

            <p
              className={`text-3xl font-bold tracking-tight ${
                balance < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </Card>
      </div>
      <TransactionsTable transactions={transactions} />
    </div>
  );
};

export default BalanceSheetTable;
