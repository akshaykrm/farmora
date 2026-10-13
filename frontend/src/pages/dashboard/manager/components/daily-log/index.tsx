import { useState } from "react";
import { Link } from "react-router";
import { ClipboardList, ExternalLink } from "lucide-react";
import LoadingMessage from "@components/LoadingMessage";
import DailyLogSection from "@pages/overview/batch/daily-log";
import SectionHeader from "../SectionHeader";
import BatchStatusCard from "./batch-status-card";
import useOpenBatchLogs from "./use-open-batch-logs";

const overviewHref = (batchId: number, seasonId: number | null) => {
  const params = new URLSearchParams();
  if (seasonId != null) params.set("season_id", String(seasonId));
  params.set("batch_id", String(batchId));
  params.set("tab", "daily-log");
  return `/overview/batch?${params.toString()}`;
};

const DashboardDailyLog = () => {
  const { data, isLoading, failed, refetch } = useOpenBatchLogs();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fallback = data.find((batch) => !batch.today) ?? data[0];
  const selected = data.find((batch) => batch.id === selectedId) ?? fallback;

  return (
    <section className="animate-in fade-in duration-700 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionHeader
          title="Daily Log"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        {selected && (
          <Link
            to={overviewHref(selected.id, selected.season_id)}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand-primary-strong hover:underline"
          >
            Open in Batch Overview
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <LoadingMessage />
      ) : failed && data.length === 0 ? (
        <p className="rounded-xl border border-brand-border bg-brand-card p-6 text-center text-sm text-brand-danger">
          Failed to load open batches
        </p>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-brand-border bg-brand-card px-4 py-10 text-center">
          <ClipboardList className="h-10 w-10 text-brand-ink-muted" />
          <p className="mt-3 font-semibold text-brand-ink">No open batches</p>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Daily logs appear here once a batch is open.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {data.map((batch) => (
              <BatchStatusCard
                key={batch.id}
                batch={batch}
                selected={batch.id === selected?.id}
                onSelect={() => setSelectedId(batch.id)}
              />
            ))}
          </div>
          {selected && (
            <DailyLogSection
              key={selected.id}
              batchId={selected.id}
              onChange={() => {
                setSelectedId(selected.id);
                refetch();
              }}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default DashboardDailyLog;
