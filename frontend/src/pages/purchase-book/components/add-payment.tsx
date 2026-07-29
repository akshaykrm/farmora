import { Dialog, DialogContent } from "@components/dialog";
import SelectList from "@components/select-list";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import { Button } from "@mui/material";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import { RHFTextField } from "@components/form/input";
import fetcherV2 from "@utils/fetcherV2";
import type { NewPaymentFormValues } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
};

function AddPayment(props: Props) {
  const sellerList = useGetVendorNames({ type: "supplier" });
  const { isOpen, onClose, refetch } = props;
  const methods = useForm<NewPaymentFormValues>({
    defaultValues: {
      amount: 0,
      date: "",
      vendor_id: null,
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
      refetch();
    } else if (res.status === "validation_error") {
      res.error.forEach((err) => {
        const { name, message } = err;
        setError(name, { message });
      });
    }
  };
  const values = watch();
  return (
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
  );
}

export default AddPayment;
