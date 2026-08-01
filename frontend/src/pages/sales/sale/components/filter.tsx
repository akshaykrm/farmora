import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import SelectList from "@components/select-list";
import FilterCard from "@components/FilterCard";
import { useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import serializeFilter from "@utils/serialie-filter";
import useGetSeasonNameList from "@hooks/use-get-season-names";
import useGetBatchNameList from "@hooks/use-get-batch-names";
import type { Filter } from "@utils/filters";

type SaleFilterType = {
  season_id: number | "";
  batch_id: number | "";
  buyer_name: string;
  start_date: string;
  end_date: string;
};

type Props = {
  handleFetch: (filter: Filter) => void;
  defaultValues: Filter;
};

const SaleFilter = ({ handleFetch, defaultValues }: Props) => {
  const seasonList = useGetSeasonNameList();
  const batchList = useGetBatchNameList({ status: "active" });

  const methods = useForm<SaleFilterType>({
    defaultValues: defaultValues,
  });

  const {
    setValue,
    watch,
    formState: { errors },
    register,
    handleSubmit,
  } = methods;

  const onFilter = handleSubmit(async (data) => {
    handleFetch(serializeFilter(data));
  });

  return (
    <FilterCard>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        <SelectList
          label="Season"
          name="season_id"
          options={seasonList.data}
          value={watch("season_id")}
          onChange={(v) => {
            setValue("season_id", v ? v : "");
          }}
        />

        <SelectList
          label="Batch"
          name="batch_id"
          options={batchList.data}
          value={watch("batch_id")}
          onChange={(v) => {
            setValue("batch_id", v ? v : "");
          }}
        />
        <TextField
          label="Buyer Name"
          size="small"
          {...register("buyer_name")}
        />

        <DatePicker
          label="From Date"
          value={watch("start_date") ? dayjs(watch("start_date")) : null}
          format="DD-MM-YYYY"
          onChange={(v) => {
            methods.setValue("start_date", v ? dayjs(v).toISOString() : "");
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
          label="To Date"
          value={watch("end_date") ? dayjs(watch("end_date")) : null}
          format="DD-MM-YYYY"
          onChange={(v) => {
            methods.setValue("end_date", v ? dayjs(v).toISOString() : "");
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

        <Button size="small" variant="contained" onClick={onFilter}>
          Search
        </Button>
      </div>
    </FilterCard>
  );
};

export default SaleFilter;
