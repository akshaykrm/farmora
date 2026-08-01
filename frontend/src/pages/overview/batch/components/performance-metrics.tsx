import {
  ArrowUpDown,
  Coins,
  Gauge,
  Percent,
  TrendingUp,
  Weight,
} from "lucide-react";
import type { ReactNode } from "react";
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
    <section className="rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-lg bg-brand-primary-soft text-brand-accent flex items-center justify-center">
          <Gauge className="w-4 h-4" />
        </span>
        <h3 className="text-lg font-semibold text-brand-ink">
          Performance Metrics
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricTile
          icon={<Weight className="w-4 h-4" />}
          label="Avg Weight"
          value={`${roundNumber(averageWeight)} kg/bird`}
        />
        <MetricTile
          icon={<Percent className="w-4 h-4" />}
          label="FCR"
          value={roundNumber(fcr)}
          valueClassName="text-brand-info"
        />
        <MetricTile
          icon={<Percent className="w-4 h-4" />}
          label="CFCR"
          value={roundNumber(cfcr)}
          valueClassName="text-brand-info"
        />
        <MetricTile
          icon={<Coins className="w-4 h-4" />}
          label="Avg Cost"
          value={`₹${roundNumber(avgCost)}/kg`}
        />
        <MetricTile
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg Rate"
          value={`₹${roundNumber(avgRate)}/kg`}
        />
        <MetricTile
          icon={<ArrowUpDown className="w-4 h-4" />}
          label="Cost - Rate Diff"
          value={`₹${roundNumber(costRateDifference)}`}
          valueClassName={
            costRateDifference >= 0 ? "text-brand-success" : "text-brand-danger"
          }
        />
      </div>
    </section>
  );
};

const MetricTile = ({
  icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) => {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-canvas p-3">
      <div className="flex items-center gap-2 text-brand-ink-muted mb-1">
        <span className="w-6 h-6 rounded-md bg-brand-primary-soft text-brand-accent flex items-center justify-center">
          {icon}
        </span>
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`text-lg font-semibold tabular-nums text-brand-ink ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

export default PerformanceMetrics;
