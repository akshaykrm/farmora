import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { formatCurrency } from "@utils/currency";
import type { SalesBookSummary } from "../types";

type Props = { summary?: SalesBookSummary };

function Summary({ summary }: Props) {
  if (!summary) {
    return null;
  }

  return (
    <Card className="mb-5">
      <div className="p-5 flex justify-between gap-4 flex-wrap">
        <div>
          <Typography className="text-sm text-brand-ink-muted">Buyer</Typography>
          <Typography variant="h6" className="font-semibold text-brand-ink">
            {summary.buyer?.name || "Nil"}
          </Typography>
        </div>
        <div>
          <Typography className="text-sm text-brand-ink-muted">
            Opening Balance
          </Typography>
          <Typography variant="h6" className="font-semibold text-brand-ink">
            {formatCurrency(summary.opening_balance)}
          </Typography>
        </div>
        <div>
          <Typography className="text-sm text-brand-ink-muted">
            Closing Balance
          </Typography>
          <Typography variant="h6" className="font-semibold text-brand-ink">
            {formatCurrency(summary.closing_balance)}
          </Typography>
        </div>
      </div>
    </Card>
  );
}

export default Summary;
