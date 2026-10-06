import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Button, TextField } from "@mui/material";
import { Dialog, DialogActions, DialogContent } from "@components/dialog";
import dailyLogApi, { responseError } from "../api";
import type { DailyLogRow } from "../types";

type Props = {
  batchId: number;
  isOpen: boolean;
  log: DailyLogRow | null;
  rows: DailyLogRow[];
  startDate: string;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  date: string;
  mortality: string;
  issued_feed: string;
  consumed_feed: string;
  avg_body_weight: string;
  remarks: string;
};

const DATE_FORMAT = "YYYY-MM-DD";

const toNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value: number) => Math.round(value * 100) / 100;

const nextDate = (rows: DailyLogRow[], startDate: string) => {
  const today = dayjs().format(DATE_FORMAT);
  if (rows.length === 0) return startDate;
  const next = dayjs(rows[rows.length - 1].date)
    .add(1, "day")
    .format(DATE_FORMAT);
  return next > today ? today : next;
};

const PreviewItem = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-xs text-brand-ink-muted">{label}</p>
    <p className="text-sm font-semibold text-brand-ink tabular-nums">{value}</p>
  </div>
);

const AddLogDialog = ({
  batchId,
  isOpen,
  log,
  rows,
  startDate,
  onClose,
  onSaved,
}: Props) => {
  const [form, setForm] = useState<FormState>({
    date: "",
    mortality: "0",
    issued_feed: "0",
    consumed_feed: "0",
    avg_body_weight: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(log);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      log
        ? {
            date: log.date,
            mortality: String(log.mortality),
            issued_feed: String(log.issued_feed),
            consumed_feed: String(log.consumed_feed),
            avg_body_weight:
              log.avg_body_weight === null ? "" : String(log.avg_body_weight),
            remarks: log.remarks || "",
          }
        : {
            date: nextDate(rows, startDate),
            mortality: "0",
            issued_feed: "0",
            consumed_feed: "0",
            avg_body_weight: "",
            remarks: "",
          },
    );
  }, [isOpen, log, rows, startDate]);

  useEffect(() => {
    if (!isOpen || isEdit || !form.date) return;
    let cancelled = false;
    dailyLogApi.prefill(batchId, form.date).then((res) => {
      if (cancelled || res.status !== "success" || !res.data) return;
      const issued = res.data.issued_feed;
      setForm((prev) => ({ ...prev, issued_feed: String(issued) }));
    });
    return () => {
      cancelled = true;
    };
  }, [batchId, form.date, isOpen, isEdit]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const age = form.date ? dayjs(form.date).diff(dayjs(startDate), "day") : null;
  const duplicate = rows.some(
    (row) => row.date === form.date && row.id !== log?.id,
  );

  const preview = useMemo(() => {
    const previous = rows
      .filter((row) => row.date < form.date && row.id !== log?.id)
      .pop();
    const prevMort = previous?.cum_mortality ?? 0;
    const prevIssued = previous?.total_issued ?? 0;
    const prevConsumed = previous?.total_consumption ?? 0;
    const totalConsumed = prevConsumed + toNumber(form.consumed_feed);
    return {
      cumMortality: prevMort + Math.trunc(toNumber(form.mortality)),
      totalConsumption: round(totalConsumed),
      feedStock: round(prevIssued + toNumber(form.issued_feed) - totalConsumed),
    };
  }, [rows, form, log]);

  const isValid =
    Boolean(form.date) &&
    form.date >= startDate &&
    !duplicate &&
    toNumber(form.mortality) >= 0 &&
    toNumber(form.issued_feed) >= 0 &&
    toNumber(form.consumed_feed) >= 0;

  const save = async () => {
    if (!isValid) return;
    setSaving(true);
    const payload = {
      date: form.date,
      mortality: Math.trunc(toNumber(form.mortality)),
      issued_feed: toNumber(form.issued_feed),
      consumed_feed: toNumber(form.consumed_feed),
      avg_body_weight:
        form.avg_body_weight === "" ? null : toNumber(form.avg_body_weight),
      remarks: form.remarks.trim() || null,
    };
    const res = log
      ? await dailyLogApi.update(batchId, log.id, payload)
      : await dailyLogApi.create(batchId, payload);
    setSaving(false);
    if (res.status === "success") {
      toast.success(isEdit ? "Daily log updated" : "Daily log added");
      onSaved();
      onClose();
    } else {
      toast.error(responseError(res, "Failed to save daily log"));
    }
  };

  const dateHelper = duplicate
    ? "A log already exists for this date"
    : form.date && form.date < startDate
      ? "Date cannot be before the start date"
      : age !== null
        ? `Age: ${age} day${age === 1 ? "" : "s"}`
        : " ";

  return (
    <Dialog
      isOpen={isOpen}
      headerTitle={isEdit ? "Edit Daily Log" : "Add Daily Log"}
      onClose={onClose}
      className="max-w-lg"
    >
      <DialogContent>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Date"
            type="date"
            size="small"
            className="col-span-2"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            error={duplicate || (Boolean(form.date) && form.date < startDate)}
            helperText={dateHelper}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: startDate, max: dayjs().format(DATE_FORMAT) },
            }}
          />
          <TextField
            label="Mortality"
            type="number"
            size="small"
            value={form.mortality}
            onChange={(e) => update("mortality", e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
          <TextField
            label="Issued Feed (bags)"
            type="number"
            size="small"
            value={form.issued_feed}
            onChange={(e) => update("issued_feed", e.target.value)}
            helperText={isEdit ? " " : "Pre-filled from feed purchases"}
            slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
          />
          <TextField
            label="Consumed Feed (bags)"
            type="number"
            size="small"
            value={form.consumed_feed}
            onChange={(e) => update("consumed_feed", e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
          />
          <TextField
            label="Avg Body Weight (kg)"
            type="number"
            size="small"
            value={form.avg_body_weight}
            onChange={(e) => update("avg_body_weight", e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 0.001 } }}
          />
          <TextField
            label="Remarks"
            size="small"
            multiline
            minRows={2}
            className="col-span-2"
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-lg border border-brand-border bg-brand-canvas p-3">
          <PreviewItem label="Cum Mort" value={preview.cumMortality} />
          <PreviewItem label="Total Cons" value={preview.totalConsumption} />
          <PreviewItem label="Feed Stock" value={preview.feedStock} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={save} disabled={saving || !isValid}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLogDialog;
