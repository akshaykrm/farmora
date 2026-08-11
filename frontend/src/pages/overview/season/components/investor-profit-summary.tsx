import {
  CircleDollarSign,
  HandCoins,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import CardStat from "@components/CardStat";
import { formatCurrency } from "@utils/currency";

type InvestorProfitSummaryProps = {
  netSeasonProfit: number;
  totalProfit: number;
  totalGeneralCost: number;
  totalGeneralSale: number;
};

const InvestorProfitSummary = (props: InvestorProfitSummaryProps) => {
  const { totalProfit, totalGeneralCost, totalGeneralSale, netSeasonProfit } =
    props;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4 mb-6">
      <CardStat
        label="Net Season Profit"
        value={formatCurrency(netSeasonProfit)}
        icon={<CircleDollarSign className="w-5 h-5" />}
        valueClassName={
          netSeasonProfit >= 0 ? "text-brand-success" : "text-brand-danger"
        }
      />
      <CardStat
        label="Total Batch Profit"
        value={formatCurrency(totalProfit)}
        icon={<PiggyBank className="w-5 h-5" />}
        valueClassName={
          totalProfit >= 0 ? "text-brand-success" : "text-brand-danger"
        }
      />
      <CardStat
        label="Total General Cost"
        value={formatCurrency(totalGeneralCost)}
        icon={<HandCoins className="w-5 h-5" />}
        valueClassName="text-brand-danger"
      />
      <CardStat
        label="Total General Sales"
        value={formatCurrency(totalGeneralSale)}
        icon={<TrendingUp className="w-5 h-5" />}
        valueClassName="text-brand-info"
      />
    </div>
  );
};

export default InvestorProfitSummary;
