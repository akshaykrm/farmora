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

const StartDateControl = ({ batchId, header, canEdit, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const canReset =
    header.start_date_source === "manual" && !!header.default_start_date;

  const openEditor = () => {
    setDate(header.log_start_date || dayjs().format("YYYY-MM-DD"));
    setOpen(true);
  };

  const save = async (value: string | null) => {
    setSaving(true);
    const res = await dailyLogApi.setStartDate(batchId, value);
    setSaving(false);
    if (res.status === "success") {
      toast.success(
        value ? "Start date updated" : "Start date reset to chick purchase",
      );
      setOpen(false);
      onChange();
    } else {
      toast.error(responseError(res, "Failed to update start date"));
    }
  };

  return (
    <>
      <span className="inline-flex items-center gap-1">
        <span className="text-brand-ink-muted">Started</span>
        <span
          className={`font-semibold ${header.log_start_date ? "text-brand-ink" : "text-amber-600"}`}
        >
          {header.log_start_date
            ? formatDate(header.log_start_date)
            : "Not set"}
        </span>
        {header.start_date_source && (
          <span className="text-xs text-brand-ink-muted">
            (
            {header.start_date_source === "manual"
              ? "set manually"
              : "from chick purchase"}
            )
          </span>
        )}
        {canEdit && (
          <Tooltip title="Change start date" arrow>
            <IconButton size="small" onClick={openEditor}>
              <Pencil className="h-3.5 w-3.5" />
            </IconButton>
          </Tooltip>
        )}
      </span>

      <Dialog
        isOpen={open}
        headerTitle="Daily Log Start Date"
        onClose={() => setOpen(false)}
      >
        <DialogContent>
          <p className="mb-4 text-sm text-brand-ink-soft">
            This is day 0 of the batch. Ages for all entries are counted from
            this date.
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
          {canReset && (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-xs text-brand-accent hover:underline disabled:opacity-50"
              disabled={saving}
              onClick={() => save(null)}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Reset to chick purchase date (
              {formatDate(header.default_start_date)})
            </button>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => save(date)}
            disabled={saving || !date}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StartDateControl;
