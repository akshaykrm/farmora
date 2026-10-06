import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Tooltip } from "@mui/material";
import { Plus } from "lucide-react";
import ExportMenu from "@components/ExportMenu";
import LoadingMessage from "@components/LoadingMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";
import usePermissions from "@hooks/use-permissions";
import useDailyLogs from "./hooks/use-daily-logs";
import dailyLogApi, { responseError } from "./api";
import LogHeaderCard from "./components/log-header-card";
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

  return (
    <>
      <LogHeaderCard
        batchId={batchId}
        header={data.header}
        canEdit={canEdit}
        onChange={refetch}
      />
      <LogSummary summary={data.summary} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Daily Logs</h2>
        <div className="flex items-center gap-2">
          <ExportMenu
            permission="batch_daily_log:export"
            endpoint={`batches/${batchId}/daily-logs/export`}
            filter={{}}
            filename="daily-log"
          />
          {canWrite &&
            (startDate ? (
              addButton
            ) : (
              <Tooltip title="Set the daily sheet start date first" arrow>
                {addButton}
              </Tooltip>
            ))}
        </div>
      </div>
      <LogTable
        rows={data.logs}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={openEdit}
        onDelete={remove}
      />

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
