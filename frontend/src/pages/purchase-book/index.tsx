import { Dialog, DialogContent } from "@components/dialog";
import SelectList from "@components/select-list";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import PageTitle from "@components/PageTitle";
import { Box, Button } from "@mui/material";
import PurchaseBookTable from "./components/table";
import { useState } from "react";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import { RHFTextField } from "@components/form/input";
import fetcherV2 from "@utils/fetcherV2";
import usePurchaseBookFilter from "./hooks/use-purchase-book-filter";
import useGetPurchaseBook from "./hooks/use-get-purchase-book";
import FilterPurchaseBook from "./components/filter";
import PurchaseBookSummaryCard from "./components/summary";
import PaginationWithLimit from "@components/pagination-with-limit";

type NewPaymentFormValues = {
  vendor_id: number | null;
  amount: number | null;
  date: string | "";
};

// TODO: Need to fix the add code
const PurchaseBookPage = () => {
  const { filter, updateQueryParams } = usePurchaseBookFilter();
  const sellerList = useGetVendorNames({ type: "supplier" });
  const { purchaseBook, refetch } = useGetPurchaseBook(filter);

  const methods = useForm<NewPaymentFormValues>({
    defaultValues: filter,
  });

  const {
    watch,
    control,
    setValue,
    clearErrors,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = methods;

  const values = watch();

  const [isOpen, setOpenAdd] = useState(false);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => {
    clearErrors();
    setOpenAdd(false);
  };

  const onSubmit = async (inputData: NewPaymentFormValues) => {
    const res = await fetcherV2(
      "items/purchase-book",
      JSON.stringify(inputData),
      {
        method: "POST",
      },
    );
    if (res.status === "success") {
      onClose();
      reset();
      clearErrors();
      if (filter) {
        if (filter.page === 1) {
          refetch({ page: 1 });
        } else {
          updateQueryParams({ page: 1 });
        }
      }
    } else if (res.status === "validation_error") {
      res.error.forEach((err) => {
        const { name, message } = err;
        setError(name, { message });
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Purchase Book" />
        <Button variant="contained" onClick={onOpen}>
          Add Payment
        </Button>
      </div>
      <div className="mb-5">
        <FilterPurchaseBook
          defaultValues={filter}
          onFilter={(p) => updateQueryParams(p)}
        />
      </div>
      <PurchaseBookSummaryCard summary={purchaseBook.summary} />

      <PurchaseBookTable data={purchaseBook.records} />

      <Box className="flex justify-end mt-4">
        <PaginationWithLimit
          limit={filter.limit}
          limits={[2, 5, 8]}
          totalPages={purchaseBook.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>

      <Dialog isOpen={isOpen} headerTitle="Add New Payment" onClose={onClose}>
        <DialogContent>
          <form {...methods} onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <SelectList
                options={sellerList.data}
                value={values.vendor_id}
                onChange={(val) => {
                  clearErrors("vendor_id");
                  setValue("vendor_id", val);
                }}
                label="Supplier"
                name="vendor_id"
                error={Boolean(errors.vendor_id)}
                helperText={errors.vendor_id?.message}
              />

              <RHFTextField
                label="Amount"
                control={control}
                name="amount"
                size="small"
              />

              <DatePicker
                label="Date"
                name="date"
                value={values.date ? dayjs(values.date) : null}
                format="DD-MM-YYYY"
                onChange={(v) => {
                  setValue("date", dayjs(v).toISOString());
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.date),
                    helperText: errors.date?.message,
                    size: "small",
                  },
                }}
              />
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outlined" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PurchaseBookPage;
