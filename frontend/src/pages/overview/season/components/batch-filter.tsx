import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import FilterCard from "@components/FilterCard";
import type { Filter } from "@utils/filters";
import { BATCH_METRIC_FILTERS } from "../types";

type Props = {
  values: Filter;
  onApply: (f: Filter) => void;
};

const FILTER_KEYS = [
  "b_search",
  "b_close_from",
  "b_close_to",
  ...BATCH_METRIC_FILTERS.flatMap(({ key }) => [
    `b_${key}_min`,
    `b_${key}_max`,
  ]),
];

const readFromProps = (values: Filter) => {
  const state: Record<string, string> = {};
  for (const k of FILTER_KEYS) {
    state[k] = values[k] ? String(values[k]) : "";
  }
  return state;
};

const BatchFilter = ({ values, onApply }: Props) => {
  const [form, setForm] = useState<Record<string, string>>(() =>
    readFromProps(values),
  );

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => {
    const update: Filter = { b_page: 1 };
    for (const k of FILTER_KEYS) {
      update[k] = form[k]?.trim() ?? "";
    }
    onApply(update);
  };

  const handleClear = () => {
    const cleared: Record<string, string> = {};
    const update: Filter = { b_page: 1 };
    for (const k of FILTER_KEYS) {
      cleared[k] = "";
      update[k] = "";
    }
    setForm(cleared);
    onApply(update);
  };

  const chips: Record<string, string> = {};
  for (const k of FILTER_KEYS) {
    if (values[k]) chips[k] = String(values[k]);
  }

  const chipFilters: Record<string, string> = {};
  if (chips.b_search) chipFilters["Batch"] = chips.b_search;
  if (chips.b_close_from) chipFilters["Closed from"] = chips.b_close_from;
  if (chips.b_close_to) chipFilters["Closed to"] = chips.b_close_to;
  for (const { key, label } of BATCH_METRIC_FILTERS) {
    if (chips[`b_${key}_min`])
      chipFilters[`${label} min`] = chips[`b_${key}_min`];
    if (chips[`b_${key}_max`])
      chipFilters[`${label} max`] = chips[`b_${key}_max`];
  }

  return (
    <FilterCard
      title="Filter Batches"
      filters={chipFilters}
      onClearAll={handleClear}
      className="mb-4!"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <TextField
          label="Batch Name"
          size="small"
          fullWidth
          value={form.b_search}
          onChange={(e) => set("b_search", e.target.value)}
        />
        <DatePicker
          label="Closed From"
          value={form.b_close_from ? dayjs(form.b_close_from) : null}
          format="DD-MM-YYYY"
          onChange={(v) =>
            set("b_close_from", v ? dayjs(v).format("YYYY-MM-DD") : "")
          }
          slotProps={{ textField: { fullWidth: true, size: "small" } }}
        />
        <DatePicker
          label="Closed To"
          value={form.b_close_to ? dayjs(form.b_close_to) : null}
          format="DD-MM-YYYY"
          onChange={(v) =>
            set("b_close_to", v ? dayjs(v).format("YYYY-MM-DD") : "")
          }
          slotProps={{ textField: { fullWidth: true, size: "small" } }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {BATCH_METRIC_FILTERS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-2 gap-2">
            <TextField
              label={`${label} Min`}
              size="small"
              type="number"
              value={form[`b_${key}_min`]}
              onChange={(e) => set(`b_${key}_min`, e.target.value)}
            />
            <TextField
              label={`${label} Max`}
              size="small"
              type="number"
              value={form[`b_${key}_max`]}
              onChange={(e) => set(`b_${key}_max`, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outlined" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="contained" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </FilterCard>
  );
};

export default BatchFilter;
