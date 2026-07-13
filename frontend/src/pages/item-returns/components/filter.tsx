import { TextField, MenuItem, Button } from "@mui/material";
import usetGetVendorNames from "@hooks/vendor/use-get-vendor-names";
import useGetItemCategoryNames from "@hooks/item-category/use-get-item-category-names";
import SelectList from "@components/select-list";
import type { ItemReturnFilterRequest } from "@app-types/item-return.types";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { removeInternal } from "@utils/remove-internal";
import useGetBatchNameList from "@hooks/use-get-batch-names";

type Props = {
  onFilter: (filterData: ItemReturnFilterRequest) => Promise<void>;
};

const defaultValues: ItemReturnFilterRequest = {
  return_type: "",
  item_category_id: "",
  from_batch: "",
  to_batch: "",
  to_vendor: "",
  status: "",
  start_date: "",
  end_date: "",
};

const FilterItemReturns = (props: Props) => {
  const vendorNames = usetGetVendorNames();
  const itemCategoryName = useGetItemCategoryNames();
  const batchNames = useGetBatchNameList({ status: "active" });

  const methods = useForm<ItemReturnFilterRequest>({
    defaultValues,
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = methods;
  const values = watch();

  const onFilter = async (inputData: ItemReturnFilterRequest) => {
    props.onFilter(inputData);
  };

  return (
    <form onSubmit={handleSubmit(onFilter)}>
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <TextField
            label="Return Type"
            {...register("return_type")}
            select
            error={Boolean(errors.return_type)}
            helperText={errors.return_type?.message}
            fullWidth
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="vendor">Vendor</MenuItem>
            <MenuItem value="batch">Batch</MenuItem>
          </TextField>

          <SelectList
            options={removeInternal(
              itemCategoryName.data?.map((t) => {
                return { id: t.id, name: t.type };
              }),
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

          <TextField
            label="Status"
            {...register("status")}
            select
            error={Boolean(errors.status)}
            helperText={errors.status?.message}
            fullWidth
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

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
      </div>
    </form>
  );
};

export default FilterItemReturns;
