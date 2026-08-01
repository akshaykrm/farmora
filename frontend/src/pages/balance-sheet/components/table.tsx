import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import TableCell from "@components/TableCell";
import DataLoading from "@components/data-loading";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import type { BalanceSheetResponse, Transaction } from "../types";
import dayjs from "dayjs";
import { Box, Card } from "@mui/material";
import { formatCurrency } from "@utils/currency";
import PaginationWithLimit from "@components/pagination-with-limit";
import type { Filter } from "@utils/filters";

type Props = {
  data: BalanceSheetResponse | null;
  isLoading: boolean;
  page: number;
  limit: number;
  onPageChange: (filter: Filter) => void;
};

const formatDate = (date: string) => {
  return dayjs(date).format("DD-MM-YYYY");
};

function BalanceSheetTable(props: Props) {
  const { data, isLoading, page, limit, onPageChange } = props;
  return (
    <Ternary
      when={isLoading}
      then={<DataLoading />}
      otherwise={
        <Ternary
          when={data !== null}
          then={
            <AllTables
              data={data!}
              page={page}
              onPageChange={onPageChange}
              limit={limit}
            />
          }
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
}

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
            <>
              {transactions.map((t, index) => (
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
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

const AllTables = ({
  data,
  limit,
  page,
  onPageChange,
}: {
  data: BalanceSheetResponse;
  page: number;
  limit: number;
  onPageChange: (f: Filter) => void;
}) => {
  const { transactions, summary } = data;

  const { total_in, total_out, closing_balance: balance } = summary;

  const totalPages = Math.ceil(transactions.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = transactions.slice(
    startIndex,
    startIndex + limit,
  );

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
      <TransactionsTable transactions={paginatedTransactions} />
      {totalPages > 1 && (
        <Box className="flex justify-end mt-4">
          <PaginationWithLimit
            totalPages={totalPages}
            page={page}
            limit={limit}
            onChange={(f) => onPageChange(f)}
          />
        </Box>
      )}
    </div>
  );
};

export default BalanceSheetTable;
