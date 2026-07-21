import type { NewSalesBookEntryRequest } from "@app-types/sales-book.types";
import SelectList from "@components/select-list";
import { TextField, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import dayjs from "dayjs";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";

type AddMethod = UseFormReturn<NewSalesBookEntryRequest, any, FieldValues>;

type Props = {
  methods: AddMethod;
  onSubmit: (payload: any) => void;
  onCancel?: () => void;
};

const SalesBookForm = ({ methods, onSubmit, onCancel }: Props) => {
  const buyersList = useGetVendorNames({ type: "customer" });

  const {
    watch,
    setValue,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const values = watch();

  return (
    <>
      <form {...methods} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <DatePicker
            label="Date *"
            value={values.date ? dayjs(values.date) : null}
            format="DD-MM-YYYY"
            onChange={(v) => {
              setValue("date", v ? dayjs(v).toISOString() : "");
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: Boolean(errors.date),
                helperText: errors.date?.message,
              },
            }}
          />

          <SelectList
            options={buyersList.data}
            value={values.buyer_id}
            onChange={(val) => {
              (setValue as any)("buyer_id", val);
            }}
            label="Buyer *"
            name="buyer_id"
            error={Boolean(errors.buyer_id)}
            helperText={errors.buyer_id?.message}
          />

          <TextField
            label="Amount *"
            {...(register as any)("amount")}
            fullWidth
            type="number"
            error={Boolean(errors.amount)}
            helperText={errors.amount?.message}
            size="small"
          />

          <TextField
            label="Narration"
            {...(register as any)("narration")}
            fullWidth
            multiline
            rows={3}
            error={Boolean(errors.narration)}
            helperText={errors.narration?.message}
            size="small"
          />
        </div>
        <div className="flex justify-end mt-6 gap-2">
          {onCancel && (
            <Button variant="outlined" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </>
  );
};

export default SalesBookForm;
