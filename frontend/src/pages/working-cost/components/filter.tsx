import { Button } from "@mui/material";
import useGetSeasonNames from "@hooks/use-get-season-names";
import SelectList from "@components/select-list";
import FilterCard from "@components/FilterCard";
import type { WorkingCostFilterRequest } from "../types";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { Filter } from "@utils/filters";

type Props = {
  onFilter: (f: Filter) => void;
  defaultValues: Filter;
};

const FilterWorkingCost = (props: Props) => {
  const { onFilter, defaultValues } = props;
  const methods = useForm<WorkingCostFilterRequest>({
    defaultValues,
  });

  const seasonNames = useGetSeasonNames();

  const { setValue, watch, handleSubmit } = methods;
  const values = watch();

  const handleFilter = handleSubmit((inputData) => {
    onFilter(inputData);
  });

  const handleClearAll = () => {
    methods.reset({ season_id: null, start_date: "", end_date: "" });
    onFilter({ season_id: null, start_date: "", end_date: "" });
  };

  return (
    <FilterCard filters={values} onClearAll={handleClearAll}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SelectList
          options={seasonNames.data}
          value={values.season_id}
          onChange={(val) => {
            setValue("season_id", val ? val : null);
          }}
          label="Season *"
          name="season_id"
        />

        <DatePicker
          label="Start Date"
          value={values.start_date ? dayjs(values.start_date) : null}
          format="DD-MM-YYYY"
          onChange={(v) => {
            setValue("start_date", v ? dayjs(v).toISOString() : "");
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
            },
          }}
        />

        <DatePicker
          label="End Date"
          value={values.end_date ? dayjs(values.end_date) : null}
          format="DD-MM-YYYY"
          onChange={(v) => {
            setValue("end_date", v ? dayjs(v).toISOString() : "");
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
            },
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button variant="contained" onClick={handleFilter}>
          Apply Filters
        </Button>
      </div>
    </FilterCard>
  );
};

export default FilterWorkingCost;
