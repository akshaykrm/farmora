import Typography from "@mui/material/Typography";
import { formatCurrency } from "@utils/currency";
import type { SalesBookSummary } from "../types";

type Props = { summary?: SalesBookSummary };

function Summary({ summary }: Props) {
  if (!summary) {
    return null;
  }

  return (
    <div className="mb-5 flex flex-wrap justify-between gap-4 border-b border-brand-border pb-5">
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
  );
}

export default Summary;
