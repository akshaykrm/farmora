import { roundNumber } from "@utils/number";

type Props = {
  averageWeight: number;
  fcr: number;
  cfcr: number;

  avgCost: number;
  avgRate: number;
  costRateDifference: number;
};

const PerformanceMetrics = (props: Props) => {
  const { averageWeight, cfcr, fcr, avgCost, avgRate, costRateDifference } =
    props;

  return (
    <>
      <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
      <div className="bg-brand-card rounded-lg shadow-sm border border-brand-border p-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">Average Weight (kg/bird):</span>
            <span className="font-semibold text-lg">
              {roundNumber(averageWeight)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">FCR (Feed Conversion Ratio):</span>
            <span className="font-semibold text-lg">{roundNumber(fcr)}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">CFCR (Corrected FCR):</span>
            <span className="font-semibold text-lg text-brand-info">
              {roundNumber(cfcr)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">AVG COST (₹/kg):</span>
            <span className="font-semibold text-lg">
              ₹{roundNumber(avgCost)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">AVG RATE (₹/kg):</span>
            <span className="font-semibold text-lg">
              ₹{roundNumber(avgRate)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brand-ink-soft">AVG COST - RATE DIFFERENCE:</span>
            <span
              className={`font-semibold text-lg ${
                costRateDifference >= 0 ? "text-brand-success" : "text-brand-danger"
              }`}
            >
              ₹{roundNumber(costRateDifference)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerformanceMetrics;
