import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import dayjs from "dayjs";
import type { PurchaseBookTransaction } from "../types";
import { formatCurrency } from "@utils/currency";

const headers = [
  "Invoice Date",
  "Quantity",
  "Price",
  "Amount",
  "Type",
  "Balance",
];

type Props = {
  data: PurchaseBookTransaction[];
};
const PurchaseBookTable = (props: Props) => {
  const { data } = props;
  const isEmpty = data?.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data?.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
              <TableCell content={item.quantity || "-"} />
              <TableCell content={formatCurrency(item.price)} />
              <TableCell content={formatCurrency(item.amount)} />
              <TableCell
                className={`${item.type === "return" ? "text-red-700" : "text-black"} capitalize`}
                content={item.type || "-"}
              />
              <TableCell content={formatCurrency(item.balance)} />
            </TableRow>
          );
        })}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No purchase records found"
            description="No purchases found for the selected vendor and date range"
          />
        }
      />
    </>
  );
};

export default PurchaseBookTable;
