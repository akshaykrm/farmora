import { Button, Card } from "@mui/material";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import SelectList from "@components/select-list";
import type { PurchaseBookFilterRequest } from "@app-types/purchase-book.types";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import FilterWrapper from "@components/filter-wrapper";

type Props = {
  onFilter: (filter: PurchaseBookFilterRequest) => Promise<void>;
};

const FilterPurchaseBook = (props: Props) => {
  const vendorNames = useGetVendorNames({ type: "supplier" });
  const methods = useForm<PurchaseBookFilterRequest>({
    defaultValues: {
      vendor_id: null,
      start_date: "",
      end_date: "",
    },
  });

  const {
    formState: { errors },
    setValue,
    watch,
  } = methods;
  const values = watch();

  return (
    <Card>
      <FilterWrapper>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SelectList
            options={vendorNames.data}
            value={values.vendor_id}
            onChange={(val) => {
              setValue("vendor_id", val);
            }}
            label="Vendor *"
            name="vendor_id"
            error={Boolean(errors.vendor_id)}
            helperText={errors.vendor_id?.message}
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
            onClick={async () => await props.onFilter(values)}
            disabled={!values.vendor_id}
          >
            Apply Filters
          </Button>
        </div>
      </FilterWrapper>
    </Card>
  );
};
export default FilterPurchaseBook;
