import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { OpenBatchLogStatus } from "@pages/overview/batch/daily-log/types";

type Props = {
  batch: OpenBatchLogStatus;
  selected: boolean;
  onSelect: () => void;
};

const LOW_FEED_BAGS = 5;

const feedClass = (stock: number) => {
  if (stock < 0) return "text-brand-danger";
  if (stock <= LOW_FEED_BAGS) return "text-amber-500";
  return "text-brand-ink";
};

const Stat = ({
  label,
  value,
  className = "text-brand-ink",
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div>
    <p className="text-[11px] text-brand-ink-muted">{label}</p>
    <p className={`text-sm font-semibold tabular-nums ${className}`}>{value}</p>
  </div>
);

const BatchStatusCard = ({ batch, selected, onSelect }: Props) => {
  const subtitle = [batch.season_name, batch.farm_name]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-64 shrink-0 flex-col gap-3 rounded-xl border p-3 text-left transition-colors ${
        selected
          ? "border-brand-primary bg-brand-success-soft"
          : "border-brand-border bg-brand-card hover:bg-brand-canvas"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-brand-ink">{batch.name}</p>
          {subtitle && (
            <p className="truncate text-xs text-brand-ink-muted">{subtitle}</p>
          )}
        </div>
        {batch.current_age !== null && (
          <span className="shrink-0 rounded-md bg-brand-canvas px-2 py-0.5 text-xs font-semibold text-brand-accent">
            Day {batch.current_age}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat
          label="Birds alive"
          value={batch.total_chicks ? batch.birds_alive : "-"}
        />
        <Stat label="Mortality" value={batch.total_mortality} />
        <Stat
          label="Feed (bags)"
          value={batch.feed_stock}
          className={feedClass(batch.feed_stock)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {!batch.log_start_date ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            No start date
          </span>
        ) : batch.today ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-success-soft px-2 py-0.5 text-brand-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Logged today · {batch.today.mortality} mort ·{" "}
            {batch.today.consumed_feed} bags
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-canvas px-2 py-0.5 text-brand-ink-muted">
            <Clock className="h-3.5 w-3.5" />
            Not logged today
          </span>
        )}
        {batch.missed_days > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            {batch.missed_days} day{batch.missed_days === 1 ? "" : "s"} missed
          </span>
        )}
      </div>
    </button>
  );
};

export default BatchStatusCard;
