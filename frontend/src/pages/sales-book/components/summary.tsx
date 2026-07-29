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
      <div className="p-5 mb-3 flex justify-between">
        <div>
          <Typography>Buyer</Typography>
          <Typography variant="h6">{summary.buyer?.name || "Nil"}</Typography>
        </div>
        <div>
          <Typography>Opening Balance</Typography>
          <Typography variant="h6">
            {formatCurrency(summary.opening_balance)}
          </Typography>
        </div>
        <div>
          <Typography>Closing Balance</Typography>
          <Typography variant="h6">
            {formatCurrency(summary.closing_balance)}
          </Typography>
        </div>
      </div>
    </Card>
  );
}

export default Summary;
