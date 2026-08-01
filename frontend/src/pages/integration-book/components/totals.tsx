import { HandCoins, TrendingDown, Wallet } from "lucide-react";
import StatCard from "@components/StatCard";
import { formatCurrency } from "@utils/currency";
import type { IntegrationBookSummary } from "../types";

type Props = {
  summary?: IntegrationBookSummary;
};

function IntegrationBookTotals(props: Props) {
  const { summary } = props;
  if (!summary) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
      <StatCard
        label="Total In"
        value={formatCurrency(summary.credit)}
        icon={<HandCoins className="w-5 h-5" />}
        valueClassName="text-brand-success"
      />
      <StatCard
        label="Total Out"
        value={formatCurrency(summary.paid)}
        icon={<TrendingDown className="w-5 h-5" />}
        valueClassName="text-brand-danger"
      />
      <StatCard
        label="Balance"
        value={formatCurrency(summary.balance)}
        icon={<Wallet className="w-5 h-5" />}
        valueClassName={
          (summary.balance || 0) > 0 ? "text-brand-success" : "text-brand-danger"
        }
      />
    </div>
  );
}

export default IntegrationBookTotals;
