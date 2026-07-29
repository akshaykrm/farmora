import TableCell from "@components/TableCell";
import TableRow from "@components/TableRow";
import { formatCurrency } from "@utils/currency";
import type { SalesBookTotals } from "../types";

type NewType = {
  totals?: SalesBookTotals;
};

function Totals({ totals }: NewType) {
  if (!totals) {
    return null;
  }

  return (
    <TableRow>
      <TableCell content={<strong>Total</strong>} />
      <TableCell content={<strong>{totals.birds}</strong>} />
      <TableCell content={<strong>{formatCurrency(totals.weight)}</strong>} />
      <TableCell content="" />
      <TableCell content={<strong>{formatCurrency(totals.amount)}</strong>} />
      <TableCell content="" />
      <TableCell content="" />
    </TableRow>
  );
}

export default Totals;
