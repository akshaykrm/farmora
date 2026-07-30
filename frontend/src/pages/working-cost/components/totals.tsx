import Card from "@mui/material/Card";
import { formatCurrency } from "@utils/currency";
import type { WorkingCostSummary } from "../types";

type Props = {
  summary?: WorkingCostSummary;
};

function WorkingCostTotals(props: Props) {
  const { summary } = props;
  if (!summary) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
      <Card className="p-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold capitalize text-muted-foreground">
            Income
          </h3>

          <p className="text-3xl font-bold tracking-tight text-green-600">
            {formatCurrency(summary.income)}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold capitalize text-muted-foreground">
            Expense
          </h3>

          <p className="text-3xl font-bold tracking-tight text-red-600">
            {formatCurrency(summary.expense)}
          </p>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold capitalize text-muted-foreground">
            Balance
          </h3>

          <p
            className={`text-3xl font-bold tracking-tight ${(summary.balance || 0) > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default WorkingCostTotals;
