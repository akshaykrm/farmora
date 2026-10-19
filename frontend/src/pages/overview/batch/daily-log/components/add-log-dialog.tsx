import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bird, NotebookPen, ShoppingCart, Wheat } from "lucide-react";
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
  sold_birds: string;
  sold_weight: string;
  avg_body_weight: string;
  remarks: string;
};

const EMPTY_FORM: Omit<FormState, "date"> = {
  mortality: "0",
  issued_feed: "0",
  consumed_feed: "0",
  sold_birds: "0",
  sold_weight: "0",
  avg_body_weight: "",
  remarks: "",
};

const DATE_FORMAT = "YYYY-MM-DD";

const toNumber = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value: number) => Math.round(value * 100) / 100;

const nextDate = (rows: DailyLogRow[], startDate: string) => {
  if (rows.length === 0) return startDate;
  return dayjs(rows[rows.length - 1].date)
    .add(1, "day")
    .format(DATE_FORMAT);
};

type SectionResult = {
  label: string;
  value: string | number;
  danger?: boolean;
};

const FormSection = ({
  title,
  icon,
  hint,
  results = [],
  children,
}: {
  title: string;
  icon: ReactNode;
  hint?: string;
  results?: SectionResult[];
  children: ReactNode;
}) => (
  <section className="flex flex-col rounded-lg border border-brand-border">
    <div className="flex-1 p-4">
      <div className="mb-3 flex items-center gap-2 text-brand-ink">
        <span className="text-brand-ink-muted">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">{children}</div>
      {hint && <p className="mt-2 text-xs text-brand-ink-muted">{hint}</p>}
    </div>
    {results.length > 0 && (
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-brand-border bg-brand-canvas px-4 py-2">
        {results.map((result) => (
          <p key={result.label} className="text-xs text-brand-ink-muted">
            {result.label}{" "}
            <span
              className={`ml-1 text-sm font-semibold tabular-nums ${
                result.danger ? "text-red-600" : "text-brand-ink"
              }`}
            >
              {result.value}
            </span>
          </p>
        ))}
      </div>
    )}
  </section>
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
  const [form, setForm] = useState<FormState>({ date: "", ...EMPTY_FORM });
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
            sold_birds: String(log.sold_birds),
            sold_weight: String(log.sold_weight),
            avg_body_weight:
              log.avg_body_weight === null ? "" : String(log.avg_body_weight),
            remarks: log.remarks || "",
          }
        : { date: nextDate(rows, startDate), ...EMPTY_FORM },
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

  const age = form.date
    ? dayjs(form.date).diff(dayjs(startDate), "day") + 1
    : null;
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
    const soldBirds = Math.trunc(toNumber(form.sold_birds));
    return {
      cumMortality: prevMort + Math.trunc(toNumber(form.mortality)),
      totalConsumption: round(totalConsumed),
      feedStock: round(prevIssued + toNumber(form.issued_feed) - totalConsumed),
      avgSaleWeight: soldBirds
        ? (toNumber(form.sold_weight) / soldBirds).toFixed(3)
        : "-",
    };
  }, [rows, form, log]);

  const isValid =
    Boolean(form.date) &&
    form.date >= startDate &&
    !duplicate &&
    toNumber(form.mortality) >= 0 &&
    toNumber(form.issued_feed) >= 0 &&
    toNumber(form.consumed_feed) >= 0 &&
    toNumber(form.sold_birds) >= 0 &&
    toNumber(form.sold_weight) >= 0;

  const save = async () => {
    if (!isValid) return;
    setSaving(true);
    const payload = {
      date: form.date,
      mortality: Math.trunc(toNumber(form.mortality)),
      issued_feed: toNumber(form.issued_feed),
      consumed_feed: toNumber(form.consumed_feed),
      sold_birds: Math.trunc(toNumber(form.sold_birds)),
      sold_weight: toNumber(form.sold_weight),
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

  const isFuture =
    Boolean(form.date) && form.date > dayjs().format(DATE_FORMAT);
  const ageText = age !== null ? `Age: Day ${age}` : " ";

  const dateHelper = duplicate
    ? "A log already exists for this date"
    : form.date && form.date < startDate
      ? "Date cannot be before the start date"
      : isFuture
        ? `${ageText} · This date is in the future`
        : ageText;

  return (
    <Dialog
      isOpen={isOpen}
      headerTitle={isEdit ? "Edit Daily Log" : "Add Daily Log"}
      onClose={onClose}
      className="max-w-3xl"
    >
      <DialogContent>
        <div className="flex flex-col gap-4">
          <TextField
            label="Date"
            type="date"
            size="small"
            className="sm:max-w-xs"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            error={duplicate || (Boolean(form.date) && form.date < startDate)}
            helperText={dateHelper}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: startDate },
            }}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSection
              title="Birds"
              icon={<Bird className="h-4 w-4" />}
              results={[
                { label: "Cum. Mortality", value: preview.cumMortality },
              ]}
            >
              <TextField
                label="Mortality"
                type="number"
                size="small"
                value={form.mortality}
                onChange={(e) => update("mortality", e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
              <TextField
                label="Avg Body Weight (kg)"
                type="number"
                size="small"
                value={form.avg_body_weight}
                onChange={(e) => update("avg_body_weight", e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 0.001 } }}
              />
            </FormSection>

            <FormSection
              title="Feed (bags)"
              icon={<Wheat className="h-4 w-4" />}
              hint={
                isEdit ? undefined : "Issued is pre-filled from feed purchases"
              }
              results={[
                { label: "Total Consumed", value: preview.totalConsumption },
                {
                  label: "Feed Stock",
                  value: preview.feedStock,
                  danger: preview.feedStock < 0,
                },
              ]}
            >
              <TextField
                label="Issued"
                type="number"
                size="small"
                value={form.issued_feed}
                onChange={(e) => update("issued_feed", e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
              />
              <TextField
                label="Consumed"
                type="number"
                size="small"
                value={form.consumed_feed}
                onChange={(e) => update("consumed_feed", e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
              />
            </FormSection>

            <FormSection
              title="Sales"
              icon={<ShoppingCart className="h-4 w-4" />}
              results={[
                { label: "Avg Sale Wt (kg)", value: preview.avgSaleWeight },
              ]}
            >
              <TextField
                label="Birds Sold"
                type="number"
                size="small"
                value={form.sold_birds}
                onChange={(e) => update("sold_birds", e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
              <TextField
                label="Weight Sold (kg)"
                type="number"
                size="small"
                value={form.sold_weight}
                onChange={(e) => update("sold_weight", e.target.value)}
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              />
            </FormSection>

            <FormSection
              title="Notes"
              icon={<NotebookPen className="h-4 w-4" />}
            >
              <TextField
                label="Remarks"
                size="small"
                multiline
                minRows={3}
                className="col-span-2"
                value={form.remarks}
                onChange={(e) => update("remarks", e.target.value)}
              />
            </FormSection>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={saving || !isValid}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLogDialog;
