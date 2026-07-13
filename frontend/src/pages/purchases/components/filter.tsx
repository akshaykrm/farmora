import { Button, Card } from "@mui/material";
import usetGetVendorNames from "@hooks/vendor/use-get-vendor-names";
import useGetItemCategoryNames from "@hooks/item-category/use-get-item-category-names";
import useGetBatchNameList from "@hooks/use-get-batch-names";
import SelectList from "@components/select-list";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import FilterWrapper from "@components/filter-wrapper";
import type { PurchaseFilterRequest } from "../types";
import type { Ref } from "react";

type Props = {
  onFilter: (inputData: PurchaseFilterRequest) => Promise<void>;
  filterButtonRef: Ref<HTMLButtonElement>;
};

const defaultValues: PurchaseFilterRequest = {
  vendor_id: "",
  category_id: "",
  batch_id: "",
  start_date: "",
  end_date: "",
};

const FilterItems = (props: Props) => {
  const { onFilter, filterButtonRef } = props;

  const methods = useForm<PurchaseFilterRequest>({
    defaultValues,
  });

  const vendorNames = usetGetVendorNames();
  const itemCategoryName = useGetItemCategoryNames();
  const batchNames = useGetBatchNameList({ status: "active" });

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

  return (
    <Card>
      <FilterWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <SelectList
            options={vendorNames.data}
            value={values.vendor_id}
            onChange={(val) => {
              setValue("vendor_id", val ? val : "");
            }}
            label="Vendor"
            name="vendor_id"
            error={Boolean(errors.vendor_id)}
            helperText={errors.vendor_id?.message}
          />

          <SelectList
            options={batchNames.data}
            value={values.batch_id}
            onChange={(val) => {
              setValue("batch_id", val ? val : "");
            }}
            label="Batch"
            name="batch_id"
            error={Boolean(errors.batch_id)}
            helperText={errors.batch_id?.message}
          />

          <SelectList
            options={itemCategoryName.data?.map((t) => {
              return { id: t.id, name: t.type };
            })}
            value={values.category_id}
            onChange={(val) => {
              setValue("category_id", val ? val : "");
            }}
            label="Item"
            name="category_id"
            error={Boolean(errors.category_id)}
            helperText={errors.category_id?.message}
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
            onClick={handleFilter}
            ref={filterButtonRef}
          >
            Apply Filters
          </Button>
        </div>
      </FilterWrapper>
    </Card>
  );
};
export default FilterItems;
