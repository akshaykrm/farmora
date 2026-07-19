import { Button, Card } from "@mui/material";
import SelectList from "@components/select-list";
import type { SalesBookFilterRequest } from "@app-types/sales-book.types";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import FilterWrapper from "@components/filter-wrapper";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";

type Props = {
  onFilter: (filter: SalesBookFilterRequest) => void;
};

const defaultValue: SalesBookFilterRequest = {
  buyer_id: "",
  from_date: "",
  end_date: "",
};

const FilterSalesBook = ({ onFilter }: Props) => {
  const methods = useForm<SalesBookFilterRequest>({
    defaultValues: defaultValue,
  });

  const {
    setValue,
    formState: { errors },
    watch,
    handleSubmit,
  } = methods;

  const values = watch();

  const buyersList = useGetVendorNames({ type: "customer" });

  const handleFilter = handleSubmit(
    async (inputData: SalesBookFilterRequest) => {
      onFilter(inputData);
    },
  );

  return (
    <Card>
      <FilterWrapper>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SelectList
            options={buyersList.data}
            value={values.buyer_id}
            onChange={(val) => {
              setValue("buyer_id", val ? val : "");
            }}
            label="Buyer *"
            name="buyer_id"
            error={Boolean(errors.buyer_id)}
            helperText={errors.buyer_id?.message}
          />

          <DatePicker
            label="From Date"
            value={values.from_date ? dayjs(values.from_date) : null}
            format="DD-MM-YYYY"
            onChange={(v) => {
              setValue("from_date", v ? dayjs(v).toISOString() : "");
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: Boolean(errors.from_date),
                helperText: errors.from_date?.message,
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
            disabled={!values.buyer_id}
          >
            Apply Filters
          </Button>
        </div>
      </FilterWrapper>
    </Card>
  );
};

export default FilterSalesBook;
