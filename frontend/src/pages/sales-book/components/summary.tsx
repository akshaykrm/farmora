import { CircleDollarSign, UserRound, Wallet } from "lucide-react";
import CardStat from "@components/CardStat";
import { formatCurrency } from "@utils/currency";
import type { SalesBookSummary } from "../types";

type Props = { summary?: SalesBookSummary };

function Summary({ summary }: Props) {
  if (!summary) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
      <CardStat
        label="Buyer"
        value={summary.buyer?.name || "Nil"}
        icon={<UserRound className="w-5 h-5" />}
        valueClassName="text-brand-ink"
      />
      <CardStat
        label="Opening Balance"
        value={formatCurrency(summary.opening_balance)}
        icon={<Wallet className="w-5 h-5" />}
        valueClassName="text-brand-ink-soft"
      />
      <CardStat
        label="Closing Balance"
        value={formatCurrency(summary.closing_balance)}
        icon={<CircleDollarSign className="w-5 h-5" />}
        valueClassName={
          summary.closing_balance > 0 ? "text-brand-success" : "text-brand-danger"
        }
      />
    </div>
  );
}

export default Summary;
