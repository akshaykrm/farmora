import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import TableCell from "@components/TableCell";
import Badge from "@components/Badge";
import CardStat from "@components/CardStat";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
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
    <Card className="overflow-hidden mb-6">
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
              <td colSpan={5} className="px-4 py-8 text-center text-brand-ink-muted">
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
                      <Badge
                        variant={t.type === "in" ? "success" : "danger"}
                      >
                        {t.type === "in" ? "IN" : "OUT"}
                      </Badge>
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
    </Card>
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

  const balance = summary.closing_balance;

  const totalPages = Math.ceil(transactions.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = transactions.slice(
    startIndex,
    startIndex + limit,
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
        <CardStat
          label="Total In"
          value={formatCurrency(summary.total_in)}
          icon={<ArrowDownCircle className="w-5 h-5" />}
          valueClassName="text-brand-success"
        />
        <CardStat
          label="Total Out"
          value={formatCurrency(summary.total_out)}
          icon={<ArrowUpCircle className="w-5 h-5" />}
          valueClassName="text-brand-danger"
        />
        <CardStat
          label="Balance"
          value={formatCurrency(balance)}
          icon={<Wallet className="w-5 h-5" />}
          valueClassName={
            balance < 0 ? "text-brand-danger" : "text-brand-success"
          }
        />
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
