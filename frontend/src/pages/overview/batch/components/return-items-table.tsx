import type { BatchOverviewReturn } from "@app-types/batch-overview.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { roundNumber } from "@utils/number";
import dayjs from "dayjs";

const returnHeaders = ["Date", "Purpose", "Quantity", "Price", "Amount"];

type Props = {
  returns: BatchOverviewReturn[];
  totalReturnFeeds: number;
  totalReturnAmount: number;
};

const ReturnItem = (props: Props) => {
  const { returns, totalReturnAmount, totalReturnFeeds } = props;
  console.log(returns)
  return (
    <>
      <h3 className="text-lg font-semibold mb-3">Returned Items</h3>
      <Table>
        <TableRow>
          {returnHeaders.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {returns.map((item, index) => {
	  const returnTo = item.return_type  === "vendor"? item.vendor?.name : item.to_batch_data?.name 
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
            content={<strong>{roundNumber(totalReturnFeeds)}</strong>}
          />
          <TableCell content="" />
          <TableCell
            content={<strong>₹{roundNumber(totalReturnAmount)}</strong>}
          />
        </TableRow>
      </Table>
      {returns && returns.length === 0 && (
        <div className="bg-gray-50 p-6 text-center text-gray-500">
          No returned items found
        </div>
      )}
    </>
  );
};

export default ReturnItem;
