import Card from "@mui/material/Card";
import type { ReactNode } from "react";

type TrendTone = "positive" | "negative" | "neutral";

type Props = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: string;
  trendTone?: TrendTone;
  valueClassName?: string;
};

const trendColors: Record<TrendTone, string> = {
  positive: "text-brand-success",
  negative: "text-brand-danger",
  neutral: "text-brand-ink-soft",
};

const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendTone = "positive",
  valueClassName = "",
}: Props) => {
  return (
    <Card className="p-6 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="text-sm font-medium capitalize text-brand-ink-soft">
            {label}
          </h3>
          <p
            className={`text-3xl font-bold tracking-tight text-brand-ink tabular-nums ${valueClassName}`}
          >
            {value}
          </p>
          {trend && (
            <p className={`text-xs font-medium ${trendColors[trendTone]}`}>
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-primary-soft text-brand-accent flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
