import Table from "@components/Table";
import dayjs from "dayjs";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import { Undo2 } from "lucide-react";
import type { InvestorTransaction } from "../types";

const headers = [
  "Txn ID",
  "Investor",
  "Type",
  "Amount",
  "Remarks",
  "Transaction Date",
  "Created Date",
  "Action",
];

const typeStyles: Record<string, string> = {
  CAPITAL_IN: "bg-brand-success-soft text-brand-success-strong",
  CAPITAL_OUT: "bg-brand-warning-soft text-brand-warning-strong",
  SETOFF: "bg-brand-warning-soft text-brand-warning-strong",
  REVERSAL: "bg-brand-danger-soft text-brand-danger-strong",
};

type Props = {
  onReverse: (transactionId: number) => void;
  transactions: InvestorTransaction[];
};

const InvestTable = ({ onReverse, transactions }: Props) => {
  const isEmpty = transactions.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell content={transaction.txn_id ?? "-"} />
            <TableCell content={transaction.investor?.investor_name ?? "-"} />
            <TableCell
              content={
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    typeStyles[transaction.transaction_type?.code ?? ""] ??
                    "bg-brand-card-soft text-brand-ink-soft"
                  }`}
                >
                  {transaction.transaction_type?.name ?? "-"}
                </span>
              }
            />
            <TableCell content={transaction.amount} />
            <TableCell content={transaction.remarks ?? "-"} />
            <TableCell
              content={
                transaction.transaction_date
                  ? dayjs(transaction.transaction_date).format("DD-MM-YYYY")
                  : "-"
              }
            />
            <TableCell
              content={
                transaction.createdAt
                  ? dayjs(transaction.createdAt).format("DD-MM-YYYY")
                  : "-"
              }
            />
            <TableCell
              content={
                transaction.transaction_type?.code !== "REVERSAL" && !transaction.has_reversal ? (
                  <Undo2
                    className="h-5 w-5 cursor-pointer text-brand-ink-muted hover:text-brand-danger"
                    onClick={() => {
                      onReverse(transaction.id);
                    }}
                  />
                ) : (
                  <span className="text-xs text-brand-ink-muted">-</span>
                )
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <EmptyContentMessage
            title="No investment transactions found"
            description="Get started by creating a new investment transaction"
          />
        }
      />
    </>
  );
};

export default InvestTable;
