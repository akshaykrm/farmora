import purchaseBookApi from "@api/purchase-book.api";
import { Dialog, DialogContent } from "@components/dialog";
import SelectList from "@components/select-list";
import dayjs from "dayjs";
import { useForm, type DefaultValues } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import PageTitle from "@components/PageTitle";
import { Button } from "@mui/material";
import PurchaseBookTable from "./components/table";
import { useState } from "react";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import { RHFTextField } from "@components/form/input";
import fetcherV2, { type FetcherReturnType } from "@utils/fetcherV2";

type NewPaymentFormValues = {
  vendor_id: number | null;
  amount: number | null;
  date: string | "";
};

const PurchaseBookPage = () => {
  const sellerList = useGetVendorNames({ type: "supplier" });

  const methods = useForm<NewPaymentFormValues>({
    defaultValues: {
      vendor_id: null,
      amount: null,
      date: "",
    },
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

  const [filter, setFilter] = useState(null);
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
        handleFilter(filter);
      }
    } else if (res.status === "validation_error") {
      res.error.forEach((err) => {
        const { name, message } = err;
        setError(name, { message });
      });
    }
  };

  const [purchaseBook, setPurchaseBook] = useState({
    items: [],
    credit: 0,
    paid: 0,
    balance: 0,
  });

  const handleFilter = async (filter) => {
    const res = await purchaseBookApi.fetchAll(filter);
    if (res.status === "success") {
      if (res.data) {
        setFilter(filter);
        setPurchaseBook(res.data);
        return;
      }
    }
    setFilter(null);
    setPurchaseBook([]);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Purchase Book" />
        <Button variant="contained" onClick={onOpen}>
          Add Payment
        </Button>
      </div>
      <PurchaseBookTable
        purchaseBook={purchaseBook}
        handleFilter={handleFilter}
      />
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
