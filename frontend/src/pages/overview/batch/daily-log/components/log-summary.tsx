import type { ReactNode } from "react";
import type { DailyLogHeader, DailyLogSummary } from "../types";

type Props = {
  header: DailyLogHeader;
  summary: DailyLogSummary;
};

const formatBags = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

const Stat = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "danger" | "warning";
}) => (
  <div className="min-w-0 px-4 py-3">
    <p className="text-xs text-brand-ink-muted">{label}</p>
    <p
      className={`mt-0.5 text-lg font-semibold ${
        tone === "danger"
          ? "text-red-600"
          : tone === "warning"
            ? "text-amber-600"
            : "text-brand-ink"
      }`}
    >
      {value}
    </p>
    {hint && (
      <p className="truncate text-xs text-brand-ink-muted" title={String(hint)}>
        {hint}
      </p>
    )}
  </div>
);

const LogSummary = ({ header, summary }: Props) => (
  <div className="grid grid-cols-2 divide-brand-border border-b border-brand-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
    <Stat
      label="Chicks Placed"
      value={header.total_chicks ? header.total_chicks.toLocaleString() : "0"}
      hint={header.companies.join(", ") || undefined}
      tone={header.total_chicks ? undefined : "warning"}
    />
    <Stat label="Birds Alive" value={summary.birds_alive.toLocaleString()} />
    <Stat
      label="Mortality"
      value={summary.total_mortality.toLocaleString()}
      hint={`${summary.mortality_pct.toFixed(2)}% of chicks`}
    />
    <Stat
      label="Feed Issued"
      value={formatBags(summary.total_issued)}
      hint="bags"
    />
    <Stat
      label="Feed Consumed"
      value={formatBags(summary.total_consumed)}
      hint="bags"
    />
    <Stat
      label="Feed Stock"
      value={formatBags(summary.feed_stock)}
      hint="bags"
      tone={summary.feed_stock < 0 ? "danger" : undefined}
    />
  </div>
);

export default LogSummary;
