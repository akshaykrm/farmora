import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Tooltip } from "@mui/material";
import { AlertTriangle, ClipboardList, Plus } from "lucide-react";
import ExportMenu from "@components/ExportMenu";
import LoadingMessage from "@components/LoadingMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";
import usePermissions from "@hooks/use-permissions";
import useDailyLogs from "./hooks/use-daily-logs";
import dailyLogApi, { responseError } from "./api";
import StartDateControl from "./components/start-date-control";
import LogSummary from "./components/log-summary";
import LogTable from "./components/log-table";
import AddLogDialog from "./components/add-log-dialog";
import type { DailyLogRow } from "./types";

type Props = {
  batchId: number;
};

const DailyLogSection = ({ batchId }: Props) => {
  const { can } = usePermissions();
  const { data, isLoading, refetch } = useDailyLogs(batchId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DailyLogRow | null>(null);

  if (isLoading && !data) return <LoadingMessage />;
  if (!data) {
    return (
      <EmptyContentMessage
        title="Daily log unavailable"
        description="The daily log for this batch could not be loaded"
      />
    );
  }

  const isOpen = !data.batch.closed_on;
  const canWrite = isOpen && can("batch_daily_log:write");
  const canEdit = isOpen && can("batch_daily_log:edit");
  const canDelete = isOpen && can("batch_daily_log:delete");
  const startDate = data.header.log_start_date;
  const currentAge = data.summary.current_age;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (row: DailyLogRow) => {
    setEditing(row);
    setDialogOpen(true);
  };

  const remove = async (row: DailyLogRow) => {
    if (!window.confirm("Delete this daily log entry?")) return;
    const res = await dailyLogApi.remove(batchId, row.id);
    if (res.status === "success") {
      toast.success("Daily log deleted");
      refetch();
    } else {
      toast.error(responseError(res, "Failed to delete daily log"));
    }
  };

  const addButton = (
    <span>
      <Button
        variant="contained"
        startIcon={<Plus className="h-4 w-4" />}
        onClick={openAdd}
        disabled={!startDate}
      >
        Add Daily Log
      </Button>
    </span>
  );

  const addAction =
    canWrite &&
    (startDate ? (
      addButton
    ) : (
      <Tooltip title="Set the start date first" arrow>
        {addButton}
      </Tooltip>
    ));

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-brand-border bg-brand-card shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-brand-ink">Daily Log</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm">
              {currentAge !== null && (
                <span className="font-semibold text-brand-accent">
                  Day {currentAge}
                </span>
              )}
              <StartDateControl
                batchId={batchId}
                header={data.header}
                canEdit={canEdit}
                onChange={refetch}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu
              permission="batch_daily_log:export"
              endpoint={`batches/${batchId}/daily-logs/export`}
              filter={{}}
              filename="daily-log"
            />
            {addAction}
          </div>
        </div>

        {!data.header.total_chicks && (
          <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              No chick purchase found for this batch, so Chicks Placed and Birds
              Alive are 0. A purchase is counted as chicks only when its
              item&apos;s type is <strong>Chick</strong>. Check the item in the
              Items menu
              {startDate ? "." : ", or set the start date manually."}
            </p>
          </div>
        )}

        <LogSummary header={data.header} summary={data.summary} />

        {data.logs.length > 0 ? (
          <LogTable
            rows={data.logs}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={openEdit}
            onDelete={remove}
          />
        ) : (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <ClipboardList className="h-10 w-10 text-brand-ink-muted" />
            <p className="mt-3 font-semibold text-brand-ink">
              No daily logs recorded yet
            </p>
            <p className="mt-1 max-w-md text-sm text-brand-ink-muted">
              {startDate
                ? "Record mortality and feed for each day to track this batch."
                : "Set the start date to begin recording daily logs."}
            </p>
            {startDate && canWrite && <div className="mt-4">{addButton}</div>}
          </div>
        )}
      </section>

      {startDate && (
        <AddLogDialog
          batchId={batchId}
          isOpen={dialogOpen}
          log={editing}
          rows={data.logs}
          startDate={startDate}
          onClose={() => setDialogOpen(false)}
          onSaved={refetch}
        />
      )}
    </>
  );
};

export default DailyLogSection;
