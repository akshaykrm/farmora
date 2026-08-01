import { TextField, MenuItem, Button } from "@mui/material";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import useGetItemCategoryNames from "@hooks/item-category/use-get-item-category-names";
import SelectList from "@components/select-list";
import FilterCard from "@components/FilterCard";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  removeInternal,
  swapNameWithTypeAndRemoveType,
} from "@utils/remove-internal";
import useGetBatchNameList from "@hooks/use-get-batch-names";
import type { ItemReturnFilterRequest } from "../types";

type Props = {
  onFilter: (filterData: ItemReturnFilterRequest) => void;
  defaultFilter: Record<string, string | number | null>;
};

const FilterItemReturns = (props: Props) => {
  const vendorNames = useGetVendorNames({ type: "supplier" });
  const itemCategoryName = useGetItemCategoryNames();
  const batchNames = useGetBatchNameList({ status: "active" });

  const methods = useForm<ItemReturnFilterRequest>({
    defaultValues: props.defaultFilter,
  });

  const {
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = methods;
  const values = watch();

  const onFilter = async (inputData: ItemReturnFilterRequest) => {
    props.onFilter(inputData);
  };

  const handleClearAll = () => {
    methods.reset({
      return_type: "",
      item_category_id: "",
      from_batch: "",
      to_batch: "",
      to_vendor: "",
      status: "",
      start_date: "",
      end_date: "",
    });
    props.onFilter({
      return_type: "",
      item_category_id: "",
      from_batch: "",
      to_batch: "",
      to_vendor: "",
      status: "",
      start_date: "",
      end_date: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onFilter)}>
      <FilterCard filters={values} onClearAll={handleClearAll}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <TextField
            label="Return Type"
            name="return_type"
            onChange={(e) => {
              const val = e.target.value;
              setValue("return_type", val ? val : "");
            }}
            value={values.return_type || "all"}
            select
            error={Boolean(errors.return_type)}
            helperText={errors.return_type?.message}
            fullWidth
            size="small"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="vendor">Vendor</MenuItem>
            <MenuItem value="batch">Batch</MenuItem>
          </TextField>

          <SelectList
            options={swapNameWithTypeAndRemoveType(
              removeInternal(itemCategoryName.data),
            )}
            value={values.item_category_id}
            onChange={(val) => {
              setValue("item_category_id", val ? val : "");
            }}
            label="Category"
            name="item_category_id"
            error={Boolean(errors.item_category_id)}
            helperText={errors.item_category_id?.message}
          />

          <SelectList
            options={batchNames.data}
            value={values.from_batch}
            onChange={(val) => {
              setValue("from_batch", val ? val : "");
            }}

            label="From Batch"
            name="from_batch"
            error={Boolean(errors.from_batch)}
            helperText={errors.from_batch?.message}
          />

          <SelectList
            options={batchNames.data}
            value={values.to_batch}
            onChange={(val) => {
              setValue("to_batch", val ? val : "");
            }}
            label="To Batch"
            name="to_batch"
            error={Boolean(errors.to_batch)}
            helperText={errors.to_batch?.message}
          />

          <SelectList
            options={vendorNames.data}
            value={values.to_vendor}
            onChange={(val) => {
              setValue("to_vendor", val ? val : "");
            }}
            label="To Vendor"
            name="to_vendor"
            error={Boolean(errors.to_vendor)}
            helperText={errors.to_vendor?.message}
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
          <Button type="submit" variant="contained">
            Apply Filters
          </Button>
        </div>
      </FilterCard>
    </form>
  );
};

export default FilterItemReturns;
