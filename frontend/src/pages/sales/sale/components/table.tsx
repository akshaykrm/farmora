import sales from "@api/sales.api";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import { useMemo } from "react";
import DataNotFound from "@components/data-not-found";
import DataLoading from "@components/data-loading";
import Ternary from "@components/ternary";
import dayjs from "dayjs";
import SaleFilter from "./filter";
import type { Sale } from "@app-types/sales.types";

const headers = [
  "ID",
  "Date",
  "Season",
  "Batch",
  "Buyer",
  "Vehicle No",
  "Weight (kg)",
  "Birds",
  "Avg Weight",
  "Price",
  "Amount",
  "Payment",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  data: Sale[];
};

const SalesTable = ({ onEdit, data }: Props) => {
  const isEmpty = data.length === 0;

  return (
    <div className="w-full">
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((sale, i) => (
          <TableRow key={sale.id}>
            <TableCell content={i + 1} />
            <TableCell content={dayjs(sale.date).format("DD-MM-YYYY")} />
            <TableCell content={sale.season?.name} />
            <TableCell content={sale.batch?.name} />
            <TableCell content={sale.buyer?.name} />
            <TableCell content={sale.vehicle_no || "-"} />
            <TableCell content={sale.weight} />
            <TableCell content={sale.bird_no} />
            <TableCell content={sale.avg_weight} />
            <TableCell content={`${sale.price}`} />
            <TableCell content={`${sale.amount}`} />
            <TableCell
              content={
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    sale.payment_type === "cash"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {sale.payment_type.toUpperCase()}
                </span>
              }
            />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                  onClick={() => {
                    onEdit(sale.id);
                  }}
                />
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No sales found"
            description="Get started by creating a new sale"
          />
        }
      />
    </div>
  );
};

export default SalesTable;
