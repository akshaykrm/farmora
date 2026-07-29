import Card from "@mui/material/Card";
import type { PurchaseBookSummary } from "../types";
import { formatCurrency } from "@utils/currency";

type Props = {
  summary?: PurchaseBookSummary;
};
function PurchaseBookSummaryCard(props: Props) {
  if (!props.summary) {
    return null;
  }
  const { balance, credit, paid } = props.summary;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
      <Card className="p-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold capitalize text-muted-foreground">
            Paid
          </h3>
          <p className="text-3xl font-bold tracking-tight text-green-600">
            {formatCurrency(paid)}
          </p>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold capitalize text-muted-foreground">
            Credit
          </h3>
          <p className="text-3xl font-bold tracking-tight text-red-600">
            {formatCurrency(credit)}
          </p>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold capitalize text-muted-foreground">
            Balance
          </h3>
          <p
            className={`text-3xl font-bold tracking-tight ${balance > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default PurchaseBookSummaryCard;
