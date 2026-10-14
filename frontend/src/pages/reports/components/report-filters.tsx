import { useMemo, useState } from "react";
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

type Props = {
  reportKey: string;
  fields: FilterField[];
  applied: ReportFilter;
  options?: ReportOptions;
  onApply: (filter: ReportFilter) => void;
};

const ReportFilters = ({
  reportKey,
  fields,
  applied,
  options,
  onApply,
}: Props) => {
  const [draft, setDraft] = useState<ReportFilter>(() =>
    Object.fromEntries(fields.map((field) => [field, applied[field] || ""])),
  );
  const set = (field: FilterField, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const batches = useMemo(
    () =>
      (options?.batches || []).filter(
        (batch) =>
          (!draft.season_id || batch.season_id === Number(draft.season_id)) &&
          (!draft.farm_id || batch.farm_id === Number(draft.farm_id)),
      ),
    [options?.batches, draft.season_id, draft.farm_id],
  );

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

  if (!fields.length) return null;

  const renderField = (field: FilterField) => {
    const label = FILTER_LABELS[field];
    if (lists[field] !== undefined || field.endsWith("_id")) {
      return (
        <SelectList
          key={field}
          name={field}
          label={label}
          options={lists[field] || []}
          value={draft[field] ? Number(draft[field]) : null}
          onChange={(id) => {
            set(field, id ? String(id) : "");
            if (field === "season_id" || field === "farm_id")
              set("batch_id", "");
          }}
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
          control={
            <Switch
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
    <section className="mb-6 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {fields.map(renderField)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {missing && (
          <p className="mr-auto text-xs text-brand-ink-muted">{missing}</p>
        )}
        <Button variant="text" onClick={clear}>
          Clear
        </Button>
        <Button
          variant="contained"
          disabled={Boolean(missing)}
          onClick={() => onApply(draft)}
        >
          Apply Filters
        </Button>
      </div>
    </section>
  );
};

export default ReportFilters;
