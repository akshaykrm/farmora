import { useState, type ReactNode } from "react";
import {
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import SelectList from "@components/select-list";
import type { NameResponse } from "@app-types/gen.types";
import { FILTER_LABELS, missingRequirement, type FilterField } from "../config";
import type { ReportFilter, ReportOptions } from "../types";
import MultiSelectList from "./multi-select-list";

const CHOICES: Partial<
  Record<FilterField, { value: string; label: string }[]>
> = {
  batch_status: [
    { value: "", label: "All batches" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ],
  payment_type: [
    { value: "", label: "All" },
    { value: "cash", label: "Cash" },
    { value: "credit", label: "Credit" },
    { value: "paid", label: "Paid" },
  ],
  days: [
    { value: "7", label: "7 days" },
    { value: "15", label: "15 days" },
    { value: "30", label: "30 days" },
  ],
};

const DATE_FIELDS: FilterField[] = ["start_date", "end_date", "as_of"];
const MULTI_FIELDS: FilterField[] = ["farm_id", "batch_id"];

const toIds = (value?: string) =>
  value ? value.split(",").map(Number).filter(Boolean) : [];

type Props = {
  reportKey: string;
  fields: FilterField[];
  applied: ReportFilter;
  options?: ReportOptions;
  onApply: (filter: ReportFilter) => void;
  /** Rendered as the first cell, e.g. super admin's company picker. */
  leading?: ReactNode;
};

const ReportFilters = ({
  reportKey,
  fields,
  applied,
  options,
  onApply,
  leading,
}: Props) => {
  const [draft, setDraft] = useState<ReportFilter>(() =>
    Object.fromEntries(fields.map((field) => [field, applied[field] || ""])),
  );

  const batchesFor = (filter: ReportFilter) => {
    const farms = toIds(filter.farm_id);
    return (options?.batches || []).filter(
      (batch) =>
        (!filter.season_id || batch.season_id === Number(filter.season_id)) &&
        (!farms.length ||
          (batch.farm_id !== null && farms.includes(batch.farm_id))),
    );
  };

  const set = (field: FilterField, value: string) =>
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if ((field === "season_id" || field === "farm_id") && next.batch_id) {
        const allowed = new Set(batchesFor(next).map((batch) => batch.id));
        next.batch_id = toIds(next.batch_id)
          .filter((id) => allowed.has(id))
          .join(",");
      }
      return next;
    });

  const batches = batchesFor(draft);

  const lists: Partial<Record<FilterField, NameResponse[]>> = {
    season_id: options?.seasons,
    farm_id: options?.farms,
    batch_id: batches.map(({ id, name, closed }) => ({
      id,
      name: closed ? name : `${name} (open)`,
    })),
    buyer_id: options?.buyers,
    vendor_id: options?.suppliers,
  };

  const missing = missingRequirement(reportKey, draft);

  if (!fields.length && !leading) return null;

  const renderField = (field: FilterField) => {
    const label = FILTER_LABELS[field];
    if (MULTI_FIELDS.includes(field)) {
      return (
        <MultiSelectList
          key={field}
          name={field}
          label={label}
          options={lists[field]}
          value={toIds(draft[field])}
          onChange={(ids) => set(field, ids.join(","))}
        />
      );
    }
    if (field.endsWith("_id")) {
      return (
        <SelectList
          key={field}
          name={field}
          label={label}
          options={lists[field] || []}
          value={draft[field] ? Number(draft[field]) : null}
          onChange={(id) => set(field, id ? String(id) : "")}
        />
      );
    }
    if (DATE_FIELDS.includes(field)) {
      return (
        <DatePicker
          key={field}
          label={label}
          value={draft[field] ? dayjs(draft[field]) : null}
          format="DD-MM-YYYY"
          onChange={(value) =>
            set(
              field,
              value && value.isValid() ? value.format("YYYY-MM-DD") : "",
            )
          }
          slotProps={{ textField: { fullWidth: true, size: "small" } }}
        />
      );
    }
    if (field === "include_open") {
      return (
        <FormControlLabel
          key={field}
          label={label}
          className="m-0"
          slotProps={{ typography: { fontSize: 14 } }}
          control={
            <Switch
              size="small"
              checked={draft.include_open === "true"}
              onChange={(event) =>
                set(field, event.target.checked ? "true" : "")
              }
            />
          }
        />
      );
    }
    return (
      <TextField
        key={field}
        select
        size="small"
        fullWidth
        label={label}
        value={draft[field] || (field === "days" ? "30" : "")}
        onChange={(event) => set(field, event.target.value)}
      >
        {(CHOICES[field] || []).map((choice) => (
          <MenuItem key={choice.value} value={choice.value}>
            {choice.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const clear = () => {
    const empty = Object.fromEntries(fields.map((field) => [field, ""]));
    setDraft(empty);
    onApply(empty);
  };

  return (
    <section className="mb-4 rounded-xl border border-brand-border bg-brand-card p-3 shadow-xs">
      <div className="grid grid-cols-2 items-center gap-3 md:grid-cols-4 xl:grid-cols-6">
        {leading}
        {fields.map(renderField)}
        {fields.length > 0 && (
          <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1 xl:col-start-6">
            <Button size="small" variant="text" onClick={clear}>
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={Boolean(missing)}
              onClick={() => onApply(draft)}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
      {fields.length > 0 && missing && (
        <p className="mt-2 text-xs text-brand-ink-muted">{missing}</p>
      )}
    </section>
  );
};

export default ReportFilters;
