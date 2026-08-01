import { Button, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FilterCard from "@components/FilterCard";
import type { Dayjs } from "dayjs";
import { useState, useEffect } from "react";
import type { BalanceSheetFilterRequest } from "../types";

type Props = {
  onFilter: (filter: BalanceSheetFilterRequest) => void;
};

const BalanceSheetFilter = (props: Props) => {
  const [fromDate, setFromDate] = useState<Dayjs | "">("");
  const [toDate, setToDate] = useState<Dayjs | "">("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    props.onFilter({});
  }, []);

  const handleApply = () => {
    const filter: BalanceSheetFilterRequest = {};

    if (fromDate) {
      filter.from_date = fromDate.format("YYYY-MM-DD");
    }
    if (toDate) {
      filter.to_date = toDate.format("YYYY-MM-DD");
    }
    if (purpose.trim()) {
      filter.purpose = purpose.trim();
    }

    props.onFilter(filter);
  };

  const handleClearAll = () => {
    setFromDate("");
    setToDate("");
    setPurpose("");
    props.onFilter({});
  };

  const filters: Record<string, unknown> = {};
  if (fromDate) {
    filters.from_date = fromDate.format("YYYY-MM-DD");
  }
  if (toDate) {
    filters.to_date = toDate.format("YYYY-MM-DD");
  }
  if (purpose.trim()) {
    filters.purpose = purpose.trim();
  }

  return (
    <FilterCard filters={filters} onClearAll={handleClearAll}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <TextField
          label="Search Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          size="small"
          placeholder="Search by purpose..."
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={fromDate || null}
            onChange={(value) => setFromDate(value)}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="To Date"
            value={toDate || null}
            onChange={(value) => setToDate(value)}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
      </div>

      <div className="flex justify-end">
        <Button variant="contained" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </FilterCard>
  );
};

export default BalanceSheetFilter;
