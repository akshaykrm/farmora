import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { roundNumber } from "@utils/number";
import dayjs from "dayjs";
import type { BatchOverviewReturn, BatchOverviewSummary } from "../types";
import { formatCurrency } from "@utils/currency";

const returnHeaders = ["Date", "Purpose", "Quantity", "Price", "Amount"];

type Props = {
  data: BatchOverviewReturn[];
  summary: BatchOverviewSummary;
};

const ReturnItem = (props: Props) => {
  const { data, summary } = props;

  const { total_returned_amount, total_returned_feeds } = summary;
  return (
    <>
      <h3 className="text-lg font-semibold mb-3">Returned Items</h3>
      <Table>
        <TableRow>
          {returnHeaders.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item, index) => {
          const returnTo =
            item.return_type === "vendor"
              ? item.vendor?.name
              : item.to_batch_data?.name;
          const purpose = `${item.category.type} return to ${returnTo}`;
          return (
            <TableRow key={index}>
              <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
              <TableCell content={purpose} />
              <TableCell content={item.quantity} />
              <TableCell content={`₹${item.rate_per_bag}`} />
              <TableCell content={`₹${item.total_amount}`} />
            </TableRow>
          );
        })}

        <TableRow>
          <TableCell content={<strong>Total</strong>} />
          <TableCell content="" />
          <TableCell
            content={<strong>{roundNumber(total_returned_feeds)}</strong>}
          />
          <TableCell content="" />
          <TableCell
            content={<strong>{formatCurrency(total_returned_amount)}</strong>}
          />
        </TableRow>
      </Table>
      {data.length === 0 && (
        <div className="bg-brand-canvas p-6 text-center text-brand-ink-muted">
          No returned items found
        </div>
      )}
    </>
  );
};

export default ReturnItem;
