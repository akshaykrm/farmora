import { Button } from "@mui/material";
import useGetSeasonNames from "@hooks/use-get-season-names";
import SelectList from "@components/select-list";
import FilterCard from "@components/FilterCard";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { RHFTextField } from "@components/form/input";

type Props = {
  onFilter: (filter: Record<string, string | number | null>) => void;
  defaultFilter: Record<string, string | number | null>;
};

const FilterGeneralSales = ({ onFilter, defaultFilter }: Props) => {
  const methods = useForm({
    defaultValues: defaultFilter,
  });
  const seasonNames = useGetSeasonNames({ status: "active" });

  const {
    watch,
    setValue,
    formState: { errors },
    control,
  } = methods;
  const values = watch();

  const handleApplyFilter = () => {
    onFilter(methods.getValues());
  };

  const handleClearAll = () => {
    methods.reset({
      season_id: null,
      purpose: "",
      start_date: "",
      end_date: "",
    });
    onFilter({ season_id: null, purpose: "", start_date: "", end_date: "" });
  };

  return (
    <FilterCard filters={values} onClearAll={handleClearAll}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SelectList
          options={seasonNames.data}
          value={values.season_id}
          onChange={(val) => {
            setValue("season_id", val);
          }}
          label="Season *"
          name="season_id"
          error={Boolean(errors.season_id)}
          helperText={errors.season_id?.message}
        />

        <RHFTextField
          label="Purpose"
          name="purpose"
          control={control}
          fullWidth
          size="small"
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
        <Button
          variant="contained"
          onClick={handleApplyFilter}
          disabled={!values.season_id}
        >
          Apply Filters
        </Button>
      </div>
    </FilterCard>
  );
};
export default FilterGeneralSales;
