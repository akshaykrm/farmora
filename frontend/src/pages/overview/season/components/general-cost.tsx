import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import dayjs from "dayjs";
import type { GeneralCostItem } from "../types";
import { formatCurrency } from "@utils/currency";

const generalHeaders = ["Date", "Purpose", "Amount"];

type GeneralCostTableProps = {
  data: GeneralCostItem[];
  totalAmount: number;
};

const GeneralCostTable = (props: GeneralCostTableProps) => {
  const { data, totalAmount } = props;
  return (
    <div className="flex-1">
      <h2 className="text-xl font-semibold mb-3">General Cost</h2>
      <Table>
        <TableRow>
          {generalHeaders.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
            <TableCell content={item.purpose} />
            <TableCell
              content={
                <span className="text-red-600">{formatCurrency(item.amount)}</span>
              }
            />
          </TableRow>
        ))}
        {data.length > 0 && (
          <TableRow>
            <TableCell content={<strong>Total</strong>} />
            <TableCell content="" />
            <TableCell
              content={
                <strong className="text-red-600">
                  {formatCurrency(totalAmount)}
                </strong>
              }
            />
          </TableRow>
        )}
      </Table>
      {data.length === 0 && (
        <div className="bg-gray-50 p-6 text-center text-gray-500">
          No general costs found
        </div>
      )}
    </div>
  );
};

export default GeneralCostTable;
