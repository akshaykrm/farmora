import CardStat from "@components/CardStat";
import { Bird, CalendarDays, Package, Skull, Wheat } from "lucide-react";
import type { DailyLogSummary } from "../types";

type Props = {
  summary: DailyLogSummary;
};

const formatBags = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

const LogSummary = ({ summary }: Props) => (
  <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
    <CardStat
      label="Birds Alive"
      value={summary.birds_alive}
      icon={<Bird className="h-5 w-5" />}
    />
    <CardStat
      label="Total Mortality"
      value={
        <span>
          {summary.total_mortality}
          <span className="ml-1 text-sm font-medium text-brand-ink-soft">
            ({summary.mortality_pct.toFixed(2)}%)
          </span>
        </span>
      }
      icon={<Skull className="h-5 w-5" />}
    />
    <CardStat
      label="Feed Issued (bags)"
      value={formatBags(summary.total_issued)}
      icon={<Package className="h-5 w-5" />}
    />
    <CardStat
      label="Feed Consumed (bags)"
      value={formatBags(summary.total_consumed)}
      icon={<Wheat className="h-5 w-5" />}
    />
    <CardStat
      label="Feed Stock (bags)"
      value={formatBags(summary.feed_stock)}
      valueClassName={summary.feed_stock < 0 ? "text-red-600" : ""}
      icon={<Package className="h-5 w-5" />}
    />
    <CardStat
      label="Current Age"
      value={summary.current_age ?? "-"}
      icon={<CalendarDays className="h-5 w-5" />}
    />
  </div>
);

export default LogSummary;
