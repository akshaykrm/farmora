import { Button } from "@mui/material";
import useGetFarmNames from "@hooks/farms/use-get-farm-names";
import SelectList from "@components/select-list";
import FilterCard from "@components/FilterCard";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { IntegrationBookFilterRequest } from "../types";
import type { Filter } from "@utils/filters";

type Props = {
  onFilter: (f: Filter) => void;
  defaultValues: Filter;
};

const FilterIntegrationBook = (props: Props) => {
  const { onFilter, defaultValues } = props;

  const methods = useForm<IntegrationBookFilterRequest>({
    defaultValues: {
      farm_id: (defaultValues.farm_id as number) || null,
      start_date: (defaultValues.start_date as string) || "",
      end_date: (defaultValues.end_date as string) || "",
    },
  });

  const farmNames = useGetFarmNames();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = methods;
  const values = watch();

  const handleFilter = handleSubmit((inputData) => {
    onFilter(inputData);
  });

  const handleClearAll = () => {
    methods.reset({ farm_id: null, start_date: "", end_date: "" });
    onFilter({ farm_id: null, start_date: "", end_date: "" });
  };

  return (
    <FilterCard filters={values} onClearAll={handleClearAll} openByDefault>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SelectList
          options={farmNames.data}
          value={values.farm_id}
          onChange={(val) => {
            setValue("farm_id", val ? val : null);
          }}
          label="Farm *"
          name="farm_id"
          error={Boolean(errors.farm_id)}
          helperText={errors.farm_id?.message}
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
              error: Boolean(errors.start_date),
              helperText: errors.start_date?.message,
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
              error: Boolean(errors.end_date),
              helperText: errors.end_date?.message,
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
export default FilterIntegrationBook;
