import { useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Button, IconButton, TextField, Tooltip } from "@mui/material";
import { CalendarDays, Pencil } from "lucide-react";
import { Dialog, DialogActions, DialogContent } from "@components/dialog";
import dailyLogApi, { responseError } from "../api";
import type { DailyLogHeader } from "../types";

type Props = {
  batchId: number;
  header: DailyLogHeader;
  canEdit: boolean;
  onChange: () => void;
};

const formatDate = (value: string | null) =>
  value ? dayjs(value).format("DD-MM-YYYY") : "-";

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-wide text-brand-ink-muted">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-brand-ink break-words">
      {value || "-"}
    </p>
  </div>
);

const LogHeaderCard = ({ batchId, header, canEdit, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const openEditor = () => {
    setDate(
      header.log_start_date ||
        header.suggested_start_date ||
        dayjs().format("YYYY-MM-DD"),
    );
    setOpen(true);
  };

  const save = async () => {
    if (!date) return;
    setSaving(true);
    const res = await dailyLogApi.setStartDate(batchId, date);
    setSaving(false);
    if (res.status === "success") {
      toast.success("Start date updated");
      setOpen(false);
      onChange();
    } else {
      toast.error(responseError(res, "Failed to update start date"));
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Field label="Farmer" value={header.farm_name} />
        <Field label="Place" value={header.place} />
        <Field label="Batch" value={header.batch_name} />
        <Field label="Season" value={header.season_name} />
        <Field
          label="Chicks Qty"
          value={
            header.total_chicks ? (
              header.total_chicks
            ) : (
              <Tooltip
                title="Assign a chick purchase to this batch to fill this in"
                arrow
              >
                <span className="text-amber-600">No chick purchase</span>
              </Tooltip>
            )
          }
        />
        <Field label="Company" value={header.companies.join(", ")} />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-ink-muted">
            Start Date
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span
              className={`text-sm font-semibold ${header.log_start_date ? "text-brand-ink" : "text-amber-600"}`}
            >
              {header.log_start_date
                ? formatDate(header.log_start_date)
                : "Not set"}
            </span>
            {canEdit && (
              <Tooltip title="Set daily sheet start date" arrow>
                <IconButton size="small" onClick={openEditor}>
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <Dialog
        isOpen={open}
        headerTitle="Daily Sheet Start Date"
        onClose={() => setOpen(false)}
      >
        <DialogContent>
          <p className="mb-4 text-sm text-brand-ink-soft">
            Age 0 on the daily sheet. Ages for all entries are counted from this
            date.
          </p>
          <TextField
            type="date"
            label="Start Date"
            size="small"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { max: dayjs().format("YYYY-MM-DD") },
            }}
          />
          {header.suggested_start_date &&
            header.suggested_start_date !== date && (
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
                onClick={() => setDate(header.suggested_start_date!)}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Use first chick purchase date (
                {formatDate(header.suggested_start_date)})
              </button>
            )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !date}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default LogHeaderCard;
