import type { MetricData } from "../types";

const colorMap: Record<string, string> = {
  blue: "text-brand-success bg-brand-success-soft border-brand-success-soft",
  amber: "text-brand-warning bg-brand-warning-soft border-brand-warning-soft",
  emerald: "text-brand-success bg-brand-success-soft border-brand-success-soft",
  rose: "text-brand-danger bg-brand-danger-soft border-brand-danger-soft",
};

function formatMetricValue(val: number, unit?: string, decimals?: number) {
  const isMoney = unit?.startsWith("₹");
  const prefix = isMoney ? "₹" : "";
  const suffix = isMoney ? unit!.slice(1) : unit ? ` ${unit}` : "";
  const absVal = Math.abs(val);
  const d = decimals ?? 2;

  const formatted = absVal.toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

  return { prefix, formatted, suffix };
}

const MetricCard = ({ label, value, trend, color, unit, subtitle, decimals }: MetricData) => {
  const isPositive = trend >= 0;
  const accentColor = colorMap[color] || colorMap.blue;
  const { prefix, formatted, suffix } = formatMetricValue(value, unit, decimals);
  const prev = formatMetricValue(
    value * (1 - trend / 100),
    unit,
    decimals
  );

  return (
    <div className="bg-brand-card p-4 rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl border ${accentColor}`}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div
          className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
            isPositive
              ? "text-brand-success bg-brand-success-soft"
              : "text-brand-danger bg-brand-danger-soft"
          }`}
        >
          {isPositive ? "+" : ""}
          {trend}%
          <svg
            className={`w-3 h-3 ml-1 ${isPositive ? "" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-brand-ink-muted mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-brand-ink tracking-tight">
          {value < 0 ? "-" : ""}
          {prefix}
          {formatted}
          {suffix}
          {subtitle && (
            <span className="text-sm font-normal text-brand-ink-muted">
              {" "}
              / {subtitle}
            </span>
          )}
        </h3>
      </div>
      <div className="mt-3 pt-3 border-t border-brand-border">
        <div className="flex items-center text-xs text-brand-ink-muted">
          <span className="font-semibold text-brand-ink-muted mr-2">Prev:</span>
          {prev.prefix}
          {prev.formatted}
          {prev.suffix}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
