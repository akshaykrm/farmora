import Table from "@components/Table";
import dayjs from "dayjs";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import { Undo2 } from "lucide-react";
import { useMemo } from "react";
import type { InvestorTransactionListResponse } from "../types";

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
  PROFIT_CREDIT: "bg-blue-100 text-blue-800",
  PROFIT_WITHDRAW: "bg-purple-100 text-purple-800",
  REVERSAL: "bg-red-100 text-red-800",
};

type Props = {
  onReverse: (transactionId: number) => void;
  data: InvestorTransactionListResponse;
};

const ProfitTable = (props: Props) => {
  const { onReverse, data } = props;

  const isEmpty = useMemo(() => {
    return data.data.length === 0;
  }, [data.data]);

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.data.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell content={transaction.txn_id ?? "-"} />
            <TableCell content={transaction.investor?.investor_name ?? "-"} />
            <TableCell
              content={
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    typeStyles[transaction.transaction_type?.code ?? ""] ??
                    "bg-gray-100 text-gray-800"
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
                transaction.transaction_type?.code !== "REVERSAL" ? (
                  <Undo2
                    className="w-5 h-5 text-gray-600 hover:text-red-600 cursor-pointer"
                    onClick={() => {
                      onReverse(transaction.id);
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No profit transactions found"
            description="Get started by creating a new profit transaction"
          />
        }
      />
    </>
  );
};

export default ProfitTable;
