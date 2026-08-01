import { roundNumber } from "@utils/number";

type InvestorProfitSummaryProps = {
  totalProfit: number;
  totalGeneralCost: number;
  totalGeneralSale: number;
};

const InvestorProfitSummary = (props: InvestorProfitSummaryProps) => {
  const { totalProfit, totalGeneralCost, totalGeneralSale } = props;
  return (
    <div className="bg-brand-card rounded-lg shadow-sm border border-brand-border p-6">
      <h2 className="text-xl font-semibold mb-4">Investor Profit Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-brand-info-soft p-4 rounded-lg">
          <p className="text-sm text-brand-ink-soft">Total Batch Profit</p>
          <SummaryItem value={totalProfit} />
        </div>
        <div className="bg-brand-danger-soft p-4 rounded-lg">
          <p className="text-sm text-brand-ink-soft">Total General Cost</p>
          <SummaryItem value={totalGeneralCost} />
        </div>

        <div className="bg-brand-success-soft p-4 rounded-lg">
          <p className="text-sm text-brand-ink-soft">Total General Sales</p>
          <SummaryItem value={totalGeneralSale} />
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ value }: { value: number }) => {
  return (
    <p
      className={`text-2xl font-bold ${
        value >= 0 ? "text-brand-info" : "text-brand-danger"
      }`}
    >
      ₹{roundNumber(value)}
    </p>
  );
};

export default InvestorProfitSummary;
