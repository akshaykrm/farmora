import { roundNumber } from "@utils/number";

type InvestorProfitSummaryProps = {
  totalProfit: number;
  totalGeneralCost: number;
  totalGeneralSale: number;
};

const InvestorProfitSummary = (props: InvestorProfitSummaryProps) => {
  const { totalProfit, totalGeneralCost, totalGeneralSale } = props;
  return (
    <section className="border-t border-brand-border pt-5">
      <h2 className="text-xl font-semibold mb-4">Investor Profit Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-l-2 border-brand-info px-4 py-1">
          <p className="text-sm text-brand-ink-soft">Total Batch Profit</p>
          <SummaryItem value={totalProfit} />
        </div>
        <div className="border-l-2 border-brand-danger px-4 py-1">
          <p className="text-sm text-brand-ink-soft">Total General Cost</p>
          <SummaryItem value={totalGeneralCost} />
        </div>

        <div className="border-l-2 border-brand-success px-4 py-1">
          <p className="text-sm text-brand-ink-soft">Total General Sales</p>
          <SummaryItem value={totalGeneralSale} />
        </div>
      </div>
    </section>
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
