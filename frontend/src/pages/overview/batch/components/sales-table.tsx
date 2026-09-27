import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { roundNumber } from "@utils/number";
import dayjs from "dayjs";
import type { BatchOverviewSale, BatchOverviewSummary } from "../types";
import { formatCurrency } from "@utils/currency";

const salesHeaders = [
  "Date",
  "Vehicle No",
  "Weight",
  "Birds",
  "Avg Weight",
  "Price",
  "Amount",
];

type Props = {
  data: BatchOverviewSale[];
  summary: BatchOverviewSummary;
};

const SalesTable = (props: Props) => {
  const { data, summary } = props;

  const { total_sale_amount, total_sale_birds, total_sale_weight } = summary;

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">Sales</h2>
      <Table>
        <TableRow>
          {salesHeaders.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
            <TableCell content={item.vehicle_no} />
            <TableCell content={item.weight ? item.weight : "-"} />
            <TableCell content={item.bird_no ?? "-"} />
            <TableCell content={item.avg_weight ? item.avg_weight : "-"} />
            <TableCell content={formatCurrency(item.price)} />
            <TableCell content={formatCurrency(item.amount)} />
          </TableRow>
        ))}

        <TableRow>
          <TableCell content={<strong>Total</strong>} />
          <TableCell content="" />
          <TableCell
            content={<strong>{roundNumber(total_sale_weight)}</strong>}
          />
          <TableCell
            content={<strong>{roundNumber(total_sale_birds)}</strong>}
          />
          <TableCell content="" />
          <TableCell content="" />
          <TableCell
            content={<strong>{formatCurrency(total_sale_amount)}</strong>}
          />
        </TableRow>
      </Table>
      {data.length === 0 && (
        <div className="bg-brand-canvas p-6 text-center text-brand-ink-muted">
          No sales found
        </div>
      )}
    </>
  );
};

export default SalesTable;
